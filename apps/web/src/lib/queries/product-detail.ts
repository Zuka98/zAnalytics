import { db, events, feedback, installs, products } from "@zanalytics/db";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";

export async function getProductById(id: string) {
	const [product] = await db
		.select()
		.from(products)
		.where(eq(products.id, id))
		.limit(1);

	return product ?? null;
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

export async function getProductEvents(opts: {
	productId: string;
	eventType?: string | null;
	installId?: string | null;
	version?: string | null;
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

	const [rows, [{ value: total }]] = await Promise.all([
		db
			.select({
				id: events.id,
				eventName: events.eventName,
				installId: events.installId,
				version: events.version,
				occurredAt: events.occurredAt,
			})
			.from(events)
			.where(where)
			.orderBy(desc(events.occurredAt))
			.limit(opts.limit)
			.offset(opts.offset),
		db.select({ value: count() }).from(events).where(where),
	]);

	return { rows, total };
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

	const [rows, [{ value: total }]] = await Promise.all([
		db
			.select({
				id: feedback.id,
				type: feedback.type,
				status: feedback.status,
				reason: feedback.reason,
				message: feedback.message,
				email: feedback.email,
				metadata: feedback.metadata,
				notes: feedback.notes,
				createdAt: feedback.createdAt,
			})
			.from(feedback)
			.where(where)
			.orderBy(desc(feedback.createdAt))
			.limit(opts.limit)
			.offset(opts.offset),
		db.select({ value: count() }).from(feedback).where(where),
	]);

	return { rows, total };
}
