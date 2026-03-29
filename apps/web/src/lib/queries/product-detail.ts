import { db, events, installs, products } from "@zanalytics/db";
import { count, desc, eq } from "drizzle-orm";

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

export async function getProductRecentEvents(productId: string, limit = 50) {
	return db
		.select({
			id: events.id,
			eventName: events.eventName,
			installId: events.installId,
			version: events.version,
			occurredAt: events.occurredAt,
		})
		.from(events)
		.where(eq(events.productId, productId))
		.orderBy(desc(events.occurredAt))
		.limit(limit);
}
