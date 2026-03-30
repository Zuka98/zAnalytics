import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import {
	db,
	events,
	feedback,
	installs,
	products,
} from "../packages/db/src/index";

const PRODUCTS = [
	{ key: "dterm", name: "Dterm", platform: "chrome" },
	{ key: "definio", name: "Definio", platform: "chrome" },
	{ key: "tab-organizer", name: "Tab Organizer", platform: "chrome" },
	{ key: "focus-mode", name: "Focus Mode", platform: "chrome" },
];

const VERSIONS: Record<string, string[]> = {
	dterm: ["2.1.0", "2.2.0", "2.3.0", "2.4.0", "2.4.1"],
	definio: ["1.0.0", "1.1.0", "1.2.0", "1.3.0"],
	"tab-organizer": ["3.0.0", "3.1.0", "3.2.0"],
	"focus-mode": ["1.0.0", "1.0.1", "1.1.0", "1.2.0"],
};

const UNINSTALL_REASONS: Record<string, string[]> = {
	dterm: [
		"Too many keyboard shortcuts to remember",
		"Conflicts with another extension",
		"No longer need it",
		"Performance issues",
		"Switching to a different tool",
	],
	definio: [
		"Definitions are sometimes inaccurate",
		"Pop-up is too intrusive",
		"Switching browsers",
		"Not using it enough",
	],
	"tab-organizer": [
		"Chrome's built-in tab groups are enough",
		"Too complex for my needs",
		"UI feels cluttered",
		"Switching to a different extension",
	],
	"focus-mode": [
		"Doesn't block all distracting sites",
		"Forgot about it",
		"Using another focus app",
		"Too aggressive with blocking",
	],
};

const BUG_MESSAGES: Record<string, string[]> = {
	dterm: [
		"Terminal doesn't open on first click, need to click twice",
		"Command history not persisting between sessions",
		"Some keyboard shortcuts stop working after Chrome update",
		"Extension crashes when switching between profiles",
	],
	definio: [
		"Definitions not showing for hyphenated words",
		"Pop-up appears behind other elements sometimes",
		"Dictionary lookup fails on PDFs",
		"Selected text not highlighted after definition popup closes",
	],
	"tab-organizer": [
		"Auto-grouping incorrectly merges unrelated tabs",
		"Groups lose their names after browser restart",
		"Drag-and-drop between groups is unreliable",
		"Search doesn't find tabs in collapsed groups",
	],
	"focus-mode": [
		"Block list not applying after Chrome restart",
		"Timer resets when switching tabs",
		"Whitelist exceptions not being respected",
		"Session stats show wrong duration",
	],
};

const FEATURE_REQUEST_MESSAGES: Record<string, string[]> = {
	dterm: [
		"Would love SSH tab support",
		"Please add support for zsh themes",
		"Multi-pane terminal layout would be amazing",
		"Add ability to sync settings across devices",
		"Custom color themes for the terminal",
	],
	definio: [
		"Add support for technical/programming terms",
		"Would love translation support for foreign words",
		"Pronunciation audio would be very helpful",
		"Option to show etymology of words",
		"Support for looking up phrases, not just single words",
	],
	"tab-organizer": [
		"Export/import group configurations",
		"Scheduled auto-grouping rules",
		"Tab usage statistics would be helpful",
		"Sync groups across devices",
		"Option to archive instead of close tabs",
	],
	"focus-mode": [
		"Pomodoro timer integration",
		"Weekly focus time summary",
		"Allow scheduled focus sessions",
		"Integration with Google Calendar",
		"Custom break reminders",
	],
};

const GENERAL_MESSAGES: Record<string, string[]> = {
	dterm: [
		"Love this extension, use it every day!",
		"Would be nice to have a dark mode option",
		"Great tool, saves me so much time",
	],
	definio: [
		"Very useful for reading research papers",
		"Clean design, works great",
		"Using this for language learning",
	],
	"tab-organizer": [
		"Finally a tab manager that makes sense",
		"Helps me stay organised at work",
		"Wish I found this sooner",
	],
	"focus-mode": [
		"Helping me stay productive, thanks!",
		"Simple and effective",
		"Great for deep work sessions",
	],
};

const USER_EMAILS = [
	"alex.johnson@gmail.com",
	"sarah.chen@outlook.com",
	"m.rodriguez@yahoo.com",
	"developer.dan@proton.me",
	"kirsty.mac@gmail.com",
	null,
	null,
	null, // many users don't provide email
];

function daysAgo(days: number, jitterHours = 12) {
	const d = new Date();
	d.setDate(d.getDate() - days);
	d.setHours(Math.floor(Math.random() * 24));
	d.setMinutes(Math.floor(Math.random() * 60));
	d.setSeconds(Math.floor(Math.random() * 60));
	if (jitterHours > 0) {
		d.setTime(
			d.getTime() + Math.floor(Math.random() * jitterHours * 3600 * 1000),
		);
	}
	return d;
}

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function pickVersion(productKey: string): string {
	const versions = VERSIONS[productKey] ?? ["1.0.0"];
	return pick(versions);
}

async function main() {
	console.log("Seeding mock data...\n");

	// Truncate dependent tables first (order matters due to FKs)
	await db.execute(
		sql`TRUNCATE TABLE feedback, events, installs RESTART IDENTITY CASCADE`,
	);
	console.log("Cleared existing data");

	// Upsert products
	const inserted = await db
		.insert(products)
		.values(PRODUCTS)
		.onConflictDoUpdate({
			target: products.key,
			set: { name: products.name, platform: products.platform },
		})
		.returning();

	console.log(`Upserted ${inserted.length} products`);

	for (const product of inserted) {
		const key = product.key;

		// --- Installs ---
		// Vary install volume per product to make dashboard more interesting
		const installCount =
			{
				dterm: 35,
				definio: 22,
				"tab-organizer": 18,
				"focus-mode": 12,
			}[key] ?? 20;

		const installIds: string[] = [];
		const installVersions: Record<string, string> = {};
		const installStatuses: Record<string, string> = {};
		const installCreatedAt: Record<string, Date> = {};

		for (let i = 0; i < installCount; i++) {
			const installId = randomUUID();
			installIds.push(installId);
			const createdDaysAgo = Math.floor(Math.random() * 80) + 1;
			const version = pickVersion(key);
			installVersions[installId] = version;

			const roll = Math.random();
			const status =
				roll < 0.62 ? "active" : roll < 0.77 ? "inactive" : "uninstalled";
			installStatuses[installId] = status;

			const firstSeen = daysAgo(createdDaysAgo, 0);
			installCreatedAt[installId] = firstSeen;

			await db.insert(installs).values({
				productId: product.id,
				installId,
				currentVersion: version,
				status,
				firstSeenAt: firstSeen,
				lastSeenAt: daysAgo(
					status === "active"
						? Math.floor(Math.random() * 5)
						: createdDaysAgo - Math.floor(Math.random() * 5),
					0,
				),
			});
		}

		// --- Events ---
		// Realistic event distribution: mostly open/heartbeat, some update, few installs/uninstalls
		const eventRows: {
			productId: string;
			installId: string;
			eventName: string;
			version: string;
			occurredAt: Date;
		}[] = [];

		for (const installId of installIds) {
			const status = installStatuses[installId];
			const version = installVersions[installId];
			const firstSeen = installCreatedAt[installId];
			const firstSeenDaysAgo = Math.round(
				(Date.now() - firstSeen.getTime()) / (1000 * 60 * 60 * 24),
			);

			// install event at first seen time
			eventRows.push({
				productId: product.id,
				installId,
				eventName: "install",
				version,
				occurredAt: firstSeen,
			});

			// active installs get regular open + heartbeat events
			if (status === "active" || status === "inactive") {
				const sessionCount =
					status === "active"
						? 10 + Math.floor(Math.random() * 20)
						: 2 + Math.floor(Math.random() * 5);

				for (let s = 0; s < sessionCount; s++) {
					const sessionDaysAgo = Math.floor(Math.random() * firstSeenDaysAgo);
					eventRows.push({
						productId: product.id,
						installId,
						eventName: "open",
						version,
						occurredAt: daysAgo(sessionDaysAgo, 0),
					});

					// 70% chance of heartbeat per session
					if (Math.random() < 0.7) {
						eventRows.push({
							productId: product.id,
							installId,
							eventName: "heartbeat",
							version,
							occurredAt: daysAgo(sessionDaysAgo, 0),
						});
					}
				}

				// 30% chance of update event
				if (Math.random() < 0.3) {
					eventRows.push({
						productId: product.id,
						installId,
						eventName: "update",
						version: pickVersion(key),
						occurredAt: daysAgo(
							Math.floor(Math.random() * firstSeenDaysAgo),
							0,
						),
					});
				}
			}

			// uninstalled installs get an uninstall_page_opened event
			if (status === "uninstalled") {
				eventRows.push({
					productId: product.id,
					installId,
					eventName: "uninstall_page_opened",
					version,
					occurredAt: daysAgo(Math.floor(Math.random() * 10) + 1, 0),
				});
			}
		}

		// Batch insert events
		const BATCH = 50;
		for (let i = 0; i < eventRows.length; i += BATCH) {
			await db.insert(events).values(eventRows.slice(i, i + BATCH));
		}

		// --- Feedback ---
		const feedbackRows: {
			productId: string;
			installId: string | null;
			type: string;
			reason: string | null;
			message: string | null;
			email: string | null;
			version: string | null;
			metadata: Record<string, unknown> | null;
			status: string;
			createdAt: Date;
		}[] = [];

		const uninstalledIds = installIds.filter(
			(id) => installStatuses[id] === "uninstalled",
		);

		// Every uninstall gets an uninstall feedback entry
		for (const installId of uninstalledIds) {
			feedbackRows.push({
				productId: product.id,
				installId,
				type: "uninstall",
				reason: pick(UNINSTALL_REASONS[key] ?? ["Other"]),
				message: Math.random() < 0.5 ? pick(GENERAL_MESSAGES[key] ?? []) : null,
				email: pick(USER_EMAILS) as string | null,
				version: installVersions[installId],
				metadata: null,
				status: pick(["new", "new", "reviewed", "dismissed"]),
				createdAt: daysAgo(Math.floor(Math.random() * 30) + 1, 0),
			});
		}

		// Bug reports (2-5 per product)
		const bugCount = 2 + Math.floor(Math.random() * 4);
		for (let i = 0; i < bugCount; i++) {
			const installId = Math.random() < 0.8 ? pick(installIds) : null;
			feedbackRows.push({
				productId: product.id,
				installId,
				type: "bug",
				reason: null,
				message: pick(BUG_MESSAGES[key] ?? ["Bug found"]),
				email: pick(USER_EMAILS) as string | null,
				version: pickVersion(key),
				metadata: { rating: 1 + Math.floor(Math.random() * 3) },
				status: pick(["new", "new", "in_progress", "resolved"]),
				createdAt: daysAgo(Math.floor(Math.random() * 60) + 1, 0),
			});
		}

		// Feature requests (3-6 per product)
		const featureCount = 3 + Math.floor(Math.random() * 4);
		for (let i = 0; i < featureCount; i++) {
			const installId = Math.random() < 0.6 ? pick(installIds) : null;
			feedbackRows.push({
				productId: product.id,
				installId,
				type: "feature_request",
				reason: null,
				message: pick(FEATURE_REQUEST_MESSAGES[key] ?? ["Feature idea"]),
				email: pick(USER_EMAILS) as string | null,
				version: pickVersion(key),
				metadata: { rating: 3 + Math.floor(Math.random() * 3) },
				status: pick(["new", "new", "reviewed", "in_progress"]),
				createdAt: daysAgo(Math.floor(Math.random() * 45) + 1, 0),
			});
		}

		// General feedback (2-4 per product)
		const generalCount = 2 + Math.floor(Math.random() * 3);
		for (let i = 0; i < generalCount; i++) {
			feedbackRows.push({
				productId: product.id,
				installId: Math.random() < 0.7 ? pick(installIds) : null,
				type: "general",
				reason: null,
				message: pick(GENERAL_MESSAGES[key] ?? ["Great extension!"]),
				email: pick(USER_EMAILS) as string | null,
				version: pickVersion(key),
				metadata: { rating: 3 + Math.floor(Math.random() * 3) },
				status: pick(["new", "reviewed"]),
				createdAt: daysAgo(Math.floor(Math.random() * 30) + 1, 0),
			});
		}

		await db.insert(feedback).values(feedbackRows);

		console.log(
			`  ${product.name}: ${installIds.length} installs, ${eventRows.length} events, ${feedbackRows.length} feedback`,
		);
	}

	console.log("\nDone!");
	process.exit(0);
}

main().catch((err) => {
	console.error("Failed to seed:", err);
	process.exit(1);
});
