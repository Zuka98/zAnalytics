import { db, events, feedback, installs, products } from "@zanalytics/db";
import { count, gte, sql } from "drizzle-orm";

function daysAgoDate(days: number) {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - days);
	return d;
}

function tsLit(d: Date) {
	return sql.raw(`'${d.toISOString()}'::timestamptz`);
}

export async function getProductStats() {
	return db
		.select({
			id: products.id,
			name: products.name,
			platform: products.platform,
			activeCount:
				sql<number>`count(${installs.id}) filter (where ${installs.status} = 'active')`.as(
					"active_count",
				),
			uninstallCount:
				sql<number>`count(${installs.id}) filter (where ${installs.status} = 'uninstalled')`.as(
					"uninstall_count",
				),
			lastActivity: sql<Date | null>`max(${events.occurredAt})`.as(
				"last_activity",
			),
		})
		.from(products)
		.leftJoin(installs, sql`${installs.productId} = ${products.id}`)
		.leftJoin(events, sql`${events.productId} = ${products.id}`)
		.groupBy(products.id, products.name, products.platform)
		.orderBy(products.name);
}

/**
 * Count new installs, uninstalls, and events within [from, to) in a single query.
 */
async function getPeriodStats(from: Date, to: Date) {
	const fromLit = tsLit(from);
	const toLit = tsLit(to);

	const [row] = await db
		.select({
			newInstalls:
				sql<number>`(select count(*) from installs where ${installs.firstSeenAt} >= ${fromLit} and ${installs.firstSeenAt} < ${toLit})`.as(
					"new_installs",
				),
			uninstalls:
				sql<number>`(select count(*) from installs where ${installs.status} = 'uninstalled' and ${installs.updatedAt} >= ${fromLit} and ${installs.updatedAt} < ${toLit})`.as(
					"uninstalls",
				),
			totalEvents:
				sql<number>`(select count(*) from events where ${events.occurredAt} >= ${fromLit} and ${events.occurredAt} < ${toLit})`.as(
					"total_events",
				),
		})
		.from(sql`(select 1) as _`);

	return {
		newInstalls: Number(row.newInstalls),
		uninstalls: Number(row.uninstalls),
		totalEvents: Number(row.totalEvents),
	};
}

export async function getOverviewStatsWithTrend(days: number | null) {
	// Single query for install totals by status
	const statusRows = await db
		.select({
			status: installs.status,
			count: count(),
		})
		.from(installs)
		.groupBy(installs.status);

	const statusMap = { active: 0, inactive: 0, uninstalled: 0 };
	for (const row of statusRows) {
		statusMap[row.status] = row.count;
	}

	if (days === null) {
		const [{ value: totalEvents }] = await db
			.select({ value: count() })
			.from(events);

		return {
			activeInstalls: statusMap.active,
			totalUninstalls: statusMap.uninstalled,
			current: null,
			previous: null,
			totalEvents,
		};
	}

	const now = new Date();
	const periodStart = daysAgoDate(days);
	const prevPeriodStart = daysAgoDate(days * 2);

	const [current, previous] = await Promise.all([
		getPeriodStats(periodStart, now),
		getPeriodStats(prevPeriodStart, periodStart),
	]);

	return {
		activeInstalls: statusMap.active,
		totalUninstalls: statusMap.uninstalled,
		current,
		previous,
		totalEvents: null,
	};
}

export async function getDailyInstalls(days: number | null) {
	const base = db
		.select({
			date: sql<string>`date_trunc('day', ${installs.firstSeenAt})::date`.as(
				"date",
			),
			installs:
				sql<number>`count(*) filter (where ${installs.status} != 'uninstalled')`.as(
					"installs",
				),
			uninstalls:
				sql<number>`count(*) filter (where ${installs.status} = 'uninstalled')`.as(
					"uninstalls",
				),
		})
		.from(installs);

	const filtered =
		days === null
			? base
			: base.where(gte(installs.firstSeenAt, daysAgoDate(days)));

	return filtered
		.groupBy(sql`date_trunc('day', ${installs.firstSeenAt})::date`)
		.orderBy(sql`date_trunc('day', ${installs.firstSeenAt})::date`);
}

export async function getEventBreakdown(days: number | null) {
	const base = db
		.select({
			eventName: events.eventName,
			productName: products.name,
			count: count().as("count"),
		})
		.from(events)
		.innerJoin(products, sql`${events.productId} = ${products.id}`);

	const filtered =
		days === null
			? base
			: base.where(gte(events.occurredAt, daysAgoDate(days)));

	const rows = await filtered
		.groupBy(events.eventName, products.name)
		.orderBy(events.eventName);

	const eventMap = new Map<
		string,
		{ eventName: string; total: number; [product: string]: number | string }
	>();

	for (const row of rows) {
		if (!eventMap.has(row.eventName)) {
			eventMap.set(row.eventName, { eventName: row.eventName, total: 0 });
		}
		const entry = eventMap.get(row.eventName);
		if (!entry) continue;
		entry[row.productName] = row.count;
		entry.total = (entry.total as number) + row.count;
	}

	const productNames = [...new Set(rows.map((r) => r.productName))].sort();

	const data = [...eventMap.values()].sort(
		(a, b) => (b.total as number) - (a.total as number),
	);

	return { data, productNames };
}

export async function getDailyEvents(days: number | null) {
	const base = db
		.select({
			date: sql<string>`date_trunc('day', ${events.occurredAt})::date`.as(
				"date",
			),
			count: count().as("count"),
		})
		.from(events);

	const filtered =
		days === null
			? base
			: base.where(gte(events.occurredAt, daysAgoDate(days)));

	return filtered
		.groupBy(sql`date_trunc('day', ${events.occurredAt})::date`)
		.orderBy(sql`date_trunc('day', ${events.occurredAt})::date`);
}

export async function getRecentFeedback(days: number | null) {
	const base = db
		.select({
			id: feedback.id,
			type: feedback.type,
			status: feedback.status,
			productName: products.name,
			reason: feedback.reason,
			message: feedback.message,
			email: feedback.email,
			metadata: feedback.metadata,
			createdAt: feedback.createdAt,
		})
		.from(feedback)
		.innerJoin(products, sql`${feedback.productId} = ${products.id}`);

	const filtered =
		days === null
			? base
			: base.where(gte(feedback.createdAt, daysAgoDate(days)));

	return filtered.orderBy(sql`${feedback.createdAt} desc`).limit(20);
}
