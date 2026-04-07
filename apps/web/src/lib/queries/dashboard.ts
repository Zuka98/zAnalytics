import { db, events, feedback, installs, products } from "@zanalytics/db";
import { and, asc, count, desc, eq, gte, sql } from "drizzle-orm";

export async function getRecentEvents(limit = 20) {
	return db
		.select({
			id: events.id,
			eventName: events.eventName,
			installId: events.installId,
			version: events.version,
			occurredAt: events.occurredAt,
			context: events.context,
			properties: events.properties,
			productId: events.productId,
			productName: products.name,
		})
		.from(events)
		.innerJoin(products, eq(events.productId, products.id))
		.orderBy(desc(events.occurredAt))
		.limit(limit);
}

function daysAgoDate(days: number) {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - days);
	return d;
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
			eventCount:
				sql<number>`(select count(*) from events where product_id = ${products.id})`.as(
					"event_count",
				),
			lastActivity:
				sql<Date | null>`(select max(occurred_at) from events where product_id = ${products.id})`.as(
					"last_activity",
				),
		})
		.from(products)
		.leftJoin(installs, sql`${installs.productId} = ${products.id}`)
		.groupBy(products.id, products.name, products.platform)
		.orderBy(products.name);
}

/**
 * Count new installs, uninstalls, and events within [from, to) in a single query.
 */
async function getPeriodStats(from: Date, to: Date) {
	const fromTs = from.toISOString();
	const toTs = to.toISOString();

	const [row] = await db
		.select({
			newInstalls:
				sql<number>`(select count(*) from installs where ${installs.firstSeenAt} >= ${fromTs}::timestamptz and ${installs.firstSeenAt} < ${toTs}::timestamptz)`.as(
					"new_installs",
				),
			uninstalls:
				sql<number>`(select count(*) from installs where ${installs.status} = 'uninstalled' and ${installs.updatedAt} >= ${fromTs}::timestamptz and ${installs.updatedAt} < ${toTs}::timestamptz)`.as(
					"uninstalls",
				),
			totalEvents:
				sql<number>`(select count(*) from events where ${events.occurredAt} >= ${fromTs}::timestamptz and ${events.occurredAt} < ${toTs}::timestamptz)`.as(
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
	const since = days !== null ? daysAgoDate(days) : null;

	const installQuery = db
		.select({
			date: sql<string>`date_trunc('day', ${installs.firstSeenAt})::date`.as(
				"date",
			),
			count: count().as("installs"),
		})
		.from(installs)
		.where(since ? gte(installs.firstSeenAt, since) : undefined)
		.groupBy(sql`date_trunc('day', ${installs.firstSeenAt})::date`);

	const uninstallQuery = db
		.select({
			date: sql<string>`date_trunc('day', ${installs.updatedAt})::date`.as(
				"date",
			),
			count: count().as("uninstalls"),
		})
		.from(installs)
		.where(
			since
				? and(
						sql`${installs.status} = 'uninstalled'`,
						gte(installs.updatedAt, since),
					)
				: sql`${installs.status} = 'uninstalled'`,
		)
		.groupBy(sql`date_trunc('day', ${installs.updatedAt})::date`);

	const [installRows, uninstallRows] = await Promise.all([
		installQuery,
		uninstallQuery,
	]);

	const merged = new Map<
		string,
		{ date: string; installs: number; uninstalls: number }
	>();
	for (const row of installRows) {
		merged.set(row.date, {
			date: row.date,
			installs: row.count,
			uninstalls: 0,
		});
	}
	for (const row of uninstallRows) {
		const existing = merged.get(row.date);
		if (existing) {
			existing.uninstalls = row.count;
		} else {
			merged.set(row.date, {
				date: row.date,
				installs: 0,
				uninstalls: row.count,
			});
		}
	}

	return [...merged.values()].sort((a, b) => a.date.localeCompare(b.date));
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

const ALL_INSTALL_SORT_COLUMNS = {
	lastSeenAt: installs.lastSeenAt,
	firstSeenAt: installs.firstSeenAt,
	status: installs.status,
} as const;

export type AllInstallSortColumn = keyof typeof ALL_INSTALL_SORT_COLUMNS;

export async function getAllInstalls(opts: {
	status?: string | null;
	installId?: string | null;
	sortBy?: AllInstallSortColumn;
	sortDir?: "asc" | "desc";
	limit: number;
	offset: number;
}) {
	const conditions = [];
	if (opts.status) {
		conditions.push(
			eq(installs.status, opts.status as "active" | "inactive" | "uninstalled"),
		);
	}
	if (opts.installId) {
		conditions.push(
			sql`${installs.installId}::text ilike ${`%${opts.installId}%`}`,
		);
	}
	const where = conditions.length > 0 ? and(...conditions) : undefined;

	const sortColumn = ALL_INSTALL_SORT_COLUMNS[opts.sortBy ?? "lastSeenAt"];
	const orderBy = opts.sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);

	const rows = await db
		.select({
			id: installs.id,
			installId: installs.installId,
			productId: installs.productId,
			productName: products.name,
			status: installs.status,
			currentVersion: installs.currentVersion,
			linkedUserId: installs.linkedUserId,
			linkedUserEmail: installs.linkedUserEmail,
			os: installs.os,
			browserVersion: installs.browserVersion,
			timezone: installs.timezone,
			firstSeenAt: installs.firstSeenAt,
			lastSeenAt: installs.lastSeenAt,
			_total: sql<number>`count(*) over()`.as("_total"),
		})
		.from(installs)
		.innerJoin(products, sql`${installs.productId} = ${products.id}`)
		.where(where)
		.orderBy(orderBy)
		.limit(opts.limit)
		.offset(opts.offset);

	const total = rows.length > 0 ? rows[0]._total : 0;

	return { rows: rows.map(({ _total, ...rest }) => rest), total };
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
			context: feedback.context,
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
