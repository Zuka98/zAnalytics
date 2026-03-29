import { db, installs, products } from "@zanalytics/db";
import { count, eq, sql } from "drizzle-orm";

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
