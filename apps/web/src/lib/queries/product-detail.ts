import { db, events, feedback, installs, products } from "@zanalytics/db";
import { and, asc, count, desc, eq, gte, sql } from "drizzle-orm";

export async function getProductById(id: string) {
	const [product] = await db
		.select()
		.from(products)
		.where(eq(products.id, id))
		.limit(1);

	return product ?? null;
}

const INSTALL_SORT_COLUMNS = {
	lastSeenAt: installs.lastSeenAt,
	firstSeenAt: installs.firstSeenAt,
	status: installs.status,
} as const;

export type InstallSortColumn = keyof typeof INSTALL_SORT_COLUMNS;

export async function getProductInstalls(opts: {
	productId: string;
	status?: string | null;
	installId?: string | null;
	sortBy?: InstallSortColumn;
	sortDir?: "asc" | "desc";
	limit: number;
	offset: number;
}) {
	const conditions = [eq(installs.productId, opts.productId)];
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
	const where = and(...conditions);

	const sortColumn = INSTALL_SORT_COLUMNS[opts.sortBy ?? "lastSeenAt"];
	const orderBy = opts.sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);

	const rows = await db
		.select({
			id: installs.id,
			installId: installs.installId,
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
		.where(where)
		.orderBy(orderBy)
		.limit(opts.limit)
		.offset(opts.offset);

	const total = rows.length > 0 ? rows[0]._total : 0;

	return { rows: rows.map(({ _total, ...rest }) => rest), total };
}

export async function getProductInstallStats(productId: string) {
	const rows = await db
		.select({
			status: installs.status,
			count: count(),
		})
		.from(installs)
		.where(eq(installs.productId, productId))
		.groupBy(installs.status);

	const stats = { active: 0, inactive: 0, uninstalled: 0 };
	for (const row of rows) {
		stats[row.status] = row.count;
	}

	return stats;
}

const EVENT_SORT_COLUMNS = {
	occurredAt: events.occurredAt,
	eventName: events.eventName,
} as const;

export type EventSortColumn = keyof typeof EVENT_SORT_COLUMNS;

export async function getProductEvents(opts: {
	productId: string;
	eventType?: string | null;
	installId?: string | null;
	version?: string | null;
	sortBy?: EventSortColumn;
	sortDir?: "asc" | "desc";
	limit: number;
	offset: number;
}) {
	const conditions = [eq(events.productId, opts.productId)];
	if (opts.eventType) {
		conditions.push(eq(events.eventName, opts.eventType));
	}
	if (opts.installId) {
		conditions.push(
			sql`${events.installId}::text ilike ${`%${opts.installId}%`}`,
		);
	}
	if (opts.version) {
		conditions.push(sql`${events.version}::text ilike ${`%${opts.version}%`}`);
	}
	const where = and(...conditions);

	const sortColumn = EVENT_SORT_COLUMNS[opts.sortBy ?? "occurredAt"];
	const orderBy = opts.sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);

	const rows = await db
		.select({
			id: events.id,
			eventName: events.eventName,
			installId: events.installId,
			version: events.version,
			occurredAt: events.occurredAt,
			context: events.context,
			properties: events.properties,
			_total: sql<number>`count(*) over()`.as("_total"),
		})
		.from(events)
		.where(where)
		.orderBy(orderBy)
		.limit(opts.limit)
		.offset(opts.offset);

	const total = rows.length > 0 ? rows[0]._total : 0;

	return { rows: rows.map(({ _total, ...rest }) => rest), total };
}

export async function getProductEventTypes(productId: string) {
	return db
		.select({ eventName: events.eventName })
		.from(events)
		.where(eq(events.productId, productId))
		.groupBy(events.eventName)
		.orderBy(events.eventName);
}

function daysAgoDate(days: number) {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() - days);
	return d;
}

export async function getProductDailyInstalls(
	productId: string,
	days: number | null,
) {
	const since = days !== null ? daysAgoDate(days) : null;

	const installConditions = since
		? and(eq(installs.productId, productId), gte(installs.firstSeenAt, since))
		: eq(installs.productId, productId);

	const uninstallConditions = since
		? and(
				eq(installs.productId, productId),
				sql`${installs.status} = 'uninstalled'`,
				gte(installs.updatedAt, since),
			)
		: and(
				eq(installs.productId, productId),
				sql`${installs.status} = 'uninstalled'`,
			);

	const [installRows, uninstallRows] = await Promise.all([
		db
			.select({
				date: sql<string>`date_trunc('day', ${installs.firstSeenAt})::date`.as(
					"date",
				),
				count: count().as("installs"),
			})
			.from(installs)
			.where(installConditions)
			.groupBy(sql`date_trunc('day', ${installs.firstSeenAt})::date`),
		db
			.select({
				date: sql<string>`date_trunc('day', ${installs.updatedAt})::date`.as(
					"date",
				),
				count: count().as("uninstalls"),
			})
			.from(installs)
			.where(uninstallConditions)
			.groupBy(sql`date_trunc('day', ${installs.updatedAt})::date`),
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

export async function getProductEventBreakdown(
	productId: string,
	days: number | null,
) {
	const base = db
		.select({
			eventName: events.eventName,
			count: count().as("count"),
		})
		.from(events);

	const filtered =
		days === null
			? base.where(eq(events.productId, productId))
			: base.where(
					and(
						eq(events.productId, productId),
						gte(events.occurredAt, daysAgoDate(days)),
					),
				);

	return filtered.groupBy(events.eventName).orderBy(desc(count()));
}

export async function getProductDailyEvents(
	productId: string,
	days: number | null,
) {
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
			? base.where(eq(events.productId, productId))
			: base.where(
					and(
						eq(events.productId, productId),
						gte(events.occurredAt, daysAgoDate(days)),
					),
				);

	return filtered
		.groupBy(sql`date_trunc('day', ${events.occurredAt})::date`)
		.orderBy(sql`date_trunc('day', ${events.occurredAt})::date`);
}

export async function getInstallByInstallId(
	productId: string,
	installId: string,
) {
	const [row] = await db
		.select({
			id: installs.id,
			installId: installs.installId,
			status: installs.status,
			currentVersion: installs.currentVersion,
			linkedUserId: installs.linkedUserId,
			linkedUserEmail: installs.linkedUserEmail,
			os: installs.os,
			browserVersion: installs.browserVersion,
			timezone: installs.timezone,
			context: installs.context,
			firstSeenAt: installs.firstSeenAt,
			lastSeenAt: installs.lastSeenAt,
		})
		.from(installs)
		.where(
			and(eq(installs.productId, productId), eq(installs.installId, installId)),
		)
		.limit(1);

	return row ?? null;
}

export async function getEventsByInstallId(opts: {
	productId: string;
	installId: string;
	sortBy?: EventSortColumn;
	sortDir?: "asc" | "desc";
	limit: number;
	offset: number;
}) {
	const where = and(
		eq(events.productId, opts.productId),
		eq(events.installId, opts.installId),
	);

	const sortColumn = EVENT_SORT_COLUMNS[opts.sortBy ?? "occurredAt"];
	const orderBy = opts.sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);

	const rows = await db
		.select({
			id: events.id,
			eventName: events.eventName,
			installId: events.installId,
			version: events.version,
			occurredAt: events.occurredAt,
			context: events.context,
			properties: events.properties,
			_total: sql<number>`count(*) over()`.as("_total"),
		})
		.from(events)
		.where(where)
		.orderBy(orderBy)
		.limit(opts.limit)
		.offset(opts.offset);

	const total = rows.length > 0 ? rows[0]._total : 0;

	return { rows: rows.map(({ _total, ...rest }) => rest), total };
}

export async function getProductFeedback(opts: {
	productId: string;
	type?: string | null;
	status?: string | null;
	limit: number;
	offset: number;
}) {
	const conditions = [eq(feedback.productId, opts.productId)];
	if (opts.type) {
		conditions.push(eq(feedback.type, opts.type));
	}
	if (opts.status) {
		conditions.push(eq(feedback.status, opts.status));
	}
	const where = and(...conditions);

	const rows = await db
		.select({
			id: feedback.id,
			type: feedback.type,
			status: feedback.status,
			reason: feedback.reason,
			message: feedback.message,
			email: feedback.email,
			metadata: feedback.metadata,
			context: feedback.context,
			notes: feedback.notes,
			createdAt: feedback.createdAt,
			_total: sql<number>`count(*) over()`.as("_total"),
		})
		.from(feedback)
		.where(where)
		.orderBy(desc(feedback.createdAt))
		.limit(opts.limit)
		.offset(opts.offset);

	const total = rows.length > 0 ? rows[0]._total : 0;

	return { rows: rows.map(({ _total, ...rest }) => rest), total };
}
