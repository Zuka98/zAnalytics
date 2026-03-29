import { randomUUID } from "node:crypto";
import { db, events, installs, products } from "../packages/db/src/index";

const PRODUCTS = [
	{ key: "dterm", name: "Dterm", platform: "chrome" },
	{ key: "definio", name: "Definio", platform: "chrome" },
	{ key: "tab-organizer", name: "Tab Organizer", platform: "chrome" },
];

const EVENT_NAMES = [
	"install",
	"open",
	"heartbeat",
	"update",
	"uninstall_page_opened",
];

function daysAgo(days: number) {
	const d = new Date();
	d.setDate(d.getDate() - days);
	d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
	return d;
}

function pickVersion() {
	const versions = ["1.0.0", "1.1.0", "1.2.0", "1.3.0", "2.0.0"];
	return versions[Math.floor(Math.random() * versions.length)];
}

async function main() {
	// Insert products
	const inserted = await db
		.insert(products)
		.values(PRODUCTS)
		.onConflictDoNothing({ target: products.key })
		.returning();

	console.log(`Inserted ${inserted.length} products`);

	for (const product of inserted) {
		// Create 8-15 installs per product
		const installCount = 8 + Math.floor(Math.random() * 8);
		const installIds: string[] = [];

		for (let i = 0; i < installCount; i++) {
			const installId = randomUUID();
			installIds.push(installId);
			const createdDaysAgo = Math.floor(Math.random() * 30) + 1;
			const version = pickVersion();

			// Decide status: ~60% active, ~15% inactive, ~25% uninstalled
			const roll = Math.random();
			const status =
				roll < 0.6 ? "active" : roll < 0.75 ? "inactive" : "uninstalled";

			await db.insert(installs).values({
				productId: product.id,
				installId,
				currentVersion: version,
				status,
				firstSeenAt: daysAgo(createdDaysAgo),
				lastSeenAt: daysAgo(
					status === "active"
						? Math.floor(Math.random() * 3)
						: createdDaysAgo - 2,
				),
			});
		}

		// Create 20-40 events per product
		const eventCount = 20 + Math.floor(Math.random() * 21);
		const eventRows = [];

		for (let i = 0; i < eventCount; i++) {
			const installId =
				installIds[Math.floor(Math.random() * installIds.length)];
			const eventName =
				EVENT_NAMES[Math.floor(Math.random() * EVENT_NAMES.length)];

			eventRows.push({
				productId: product.id,
				installId,
				eventName,
				version: pickVersion(),
				occurredAt: daysAgo(Math.floor(Math.random() * 30)),
			});
		}

		await db.insert(events).values(eventRows);
		console.log(
			`  ${product.name}: ${installCount} installs, ${eventCount} events`,
		);
	}

	console.log("Done!");
	process.exit(0);
}

main().catch((err) => {
	console.error("Failed to seed:", err);
	process.exit(1);
});
