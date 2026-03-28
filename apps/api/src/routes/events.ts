import { events, installs, products } from "@zanalytics/db/schema";
import { and, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

interface EventBody {
	product: string;
	installId?: string;
	eventName: string;
	version?: string;
	properties?: Record<string, unknown>;
}

export async function eventRoutes(app: FastifyInstance) {
	app.post<{ Body: EventBody }>("/v1/events", async (request, reply) => {
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
			switch (eventName) {
				case "install": {
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
								lastSeenAt: new Date(),
								status: "active",
								updatedAt: new Date(),
							},
						});
					break;
				}
				case "open":
				case "heartbeat":
				case "update": {
					await db
						.update(installs)
						.set({
							lastSeenAt: new Date(),
							currentVersion: version,
							updatedAt: new Date(),
						})
						.where(
							and(
								eq(installs.productId, product.id),
								eq(installs.installId, installId),
							),
						);
					break;
				}
				case "uninstall_page_opened": {
					await db
						.update(installs)
						.set({
							status: "uninstalled",
							updatedAt: new Date(),
						})
						.where(
							and(
								eq(installs.productId, product.id),
								eq(installs.installId, installId),
							),
						);
					break;
				}
			}
		}

		return reply.status(201).send({ ok: true, eventId: event.id });
	});
}
