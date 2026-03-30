import { events, installs, products } from "@zanalytics/db/schema";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

const eventBodySchema = {
	type: "object",
	required: ["product", "eventName"],
	properties: {
		product: { type: "string", minLength: 1 },
		installId: { type: "string", format: "uuid" },
		eventName: { type: "string", minLength: 1 },
		version: { type: "string" },
		properties: { type: "object", additionalProperties: true },
	},
	additionalProperties: false,
} as const;

interface EventBody {
	product: string;
	installId?: string;
	eventName: string;
	version?: string;
	properties?: Record<string, unknown>;
}

const INSTALL_EVENTS = new Set(["install", "uninstall_page_opened"]);
const ACTIVITY_EVENTS = new Set(["open", "heartbeat", "update"]);

export async function eventRoutes(app: FastifyInstance) {
	app.post<{ Body: EventBody }>(
		"/v1/events",
		{
			schema: { body: eventBodySchema },
			config: {
				rateLimit: {
					max: 60,
					timeWindow: "1 minute",
				},
			},
		},
		async (request, reply) => {
			const {
				product: productKey,
				installId,
				eventName,
				version,
				properties,
			} = request.body;

			// Look up product by key
			const [product] = await db
				.select()
				.from(products)
				.where(eq(products.key, productKey));

			if (!product) {
				return reply
					.status(400)
					.send({ error: `Unknown product: ${productKey}` });
			}

			// Require installId for install-lifecycle and activity events
			if (
				(INSTALL_EVENTS.has(eventName) || ACTIVITY_EVENTS.has(eventName)) &&
				!installId
			) {
				return reply
					.status(400)
					.send({ error: `installId is required for "${eventName}" events` });
			}

			// Insert event
			const [event] = await db
				.insert(events)
				.values({
					productId: product.id,
					installId,
					eventName,
					version,
					properties,
				})
				.returning();

			// Update installs table based on event type
			if (installId) {
				const now = new Date();

				if (eventName === "install" || ACTIVITY_EVENTS.has(eventName)) {
					// Upsert: create record on install, or update lastSeenAt on activity.
					// Activity events also upsert so missed installs don't cause silent no-ops.
					await db
						.insert(installs)
						.values({
							productId: product.id,
							installId,
							currentVersion: version,
							status: "active",
						})
						.onConflictDoUpdate({
							target: [installs.productId, installs.installId],
							set: {
								currentVersion: version,
								lastSeenAt: now,
								status: "active",
								updatedAt: now,
							},
						});
				} else if (eventName === "uninstall_page_opened") {
					// Mark as uninstalled. Upsert in case install record was never created.
					await db
						.insert(installs)
						.values({
							productId: product.id,
							installId,
							status: "uninstalled",
						})
						.onConflictDoUpdate({
							target: [installs.productId, installs.installId],
							set: {
								status: "uninstalled",
								updatedAt: now,
							},
						});
				}
			}

			return reply.status(201).send({ ok: true, eventId: event.id });
		},
	);
}
