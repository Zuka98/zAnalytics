import { db, events, installs, products } from "@zanalytics/db";
import { count, eq, gte, sql } from "drizzle-orm";

export async function getOverviewStats() {
	const [[productCount], [activeCount], [uninstallCount]] = await Promise.all([
		db.select({ value: count() }).from(products),
		db
			.select({ value: count() })
			.from(installs)
			.where(eq(installs.status, "active")),
		db
			.select({ value: count() })
			.from(installs)
			.where(eq(installs.status, "uninstalled")),
	]);

	return {
		totalProducts: productCount.value,
		activeInstalls: activeCount.value,
		uninstalls: uninstallCount.value,
	};
}

export async function getProductStats() {
	const rows = await db
		.select({
			id: products.id,
			name: products.name,
			platform: products.platform,
			activeCount:
				sql<number>`coalesce((select count(*) from installs where installs.product_id = ${products.id} and installs.status = 'active'), 0)`.as(
					"active_count",
				),
			uninstallCount:
				sql<number>`coalesce((select count(*) from installs where installs.product_id = ${products.id} and installs.status = 'uninstalled'), 0)`.as(
					"uninstall_count",
				),
			lastActivity:
				sql<Date | null>`(select max(events.occurred_at) from events where events.product_id = ${products.id})`.as(
					"last_activity",
				),
		})
		.from(products)
		.orderBy(products.name);

	return rows;
}

function daysAgoDate(days: number) {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - days);
	return d;
}

/**
 * Count new installs and uninstalls that occurred within [from, to).
 * - newInstalls: installs first seen in this window
 * - uninstalls: installs whose status changed to 'uninstalled' in this window
 * - totalEvents: events that occurred in this window
 */
async function getPeriodStats(from: Date, to: Date) {
	const fromLit = sql.raw(`'${from.toISOString()}'::timestamptz`);
	const toLit = sql.raw(`'${to.toISOString()}'::timestamptz`);

	const [[newInstalls], [uninstallCount], [eventCount]] = await Promise.all([
		db
			.select({ value: count() })
			.from(installs)
			.where(
				sql`${installs.firstSeenAt} >= ${fromLit} and ${installs.firstSeenAt} < ${toLit}`,
			),
		db
			.select({ value: count() })
			.from(installs)
			.where(
				sql`${installs.status} = 'uninstalled' and ${installs.updatedAt} >= ${fromLit} and ${installs.updatedAt} < ${toLit}`,
			),
		db
			.select({ value: count() })
			.from(events)
			.where(
				sql`${events.occurredAt} >= ${fromLit} and ${events.occurredAt} < ${toLit}`,
			),
	]);

	return {
		newInstalls: newInstalls.value,
		uninstalls: uninstallCount.value,
		totalEvents: eventCount.value,
	};
}

export async function getOverviewStatsWithTrend(days: number | null) {
	// Totals that are always shown regardless of period
	const [[activeTotal], [uninstallTotal]] = await Promise.all([
		db
			.select({ value: count() })
			.from(installs)
			.where(eq(installs.status, "active")),
		db
			.select({ value: count() })
			.from(installs)
			.where(eq(installs.status, "uninstalled")),
	]);

	if (days === null) {
		const [[eventTotal]] = await Promise.all([
			db.select({ value: count() }).from(events),
		]);

		return {
			activeInstalls: activeTotal.value,
			totalUninstalls: uninstallTotal.value,
			current: null,
			previous: null,
			totalEvents: eventTotal.value,
		};
	}

	// "now" is the actual current moment, not midnight, so "Today" includes today's data
	const now = new Date();
	const periodStart = daysAgoDate(days);
	const prevPeriodStart = daysAgoDate(days * 2);

	const [current, previous] = await Promise.all([
		getPeriodStats(periodStart, now),
		getPeriodStats(prevPeriodStart, periodStart),
	]);

	return {
		activeInstalls: activeTotal.value,
		totalUninstalls: uninstallTotal.value,
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
		.orderBy(sql`sum(count(*)) over (partition by ${events.eventName}) desc`);

	// Reshape: group rows by eventName, with per-product counts
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

	// Collect all product names for chart config
	const productNames = [...new Set(rows.map((r) => r.productName))].sort();

	// Sort by total desc
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
