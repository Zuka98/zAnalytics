import { events, FEEDBACK_TYPES, feedback, products } from "@zanalytics/db";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

const feedbackBodySchema = {
	type: "object",
	required: ["product", "type"],
	properties: {
		product: { type: "string", minLength: 1 },
		installId: { type: "string", format: "uuid" },
		type: { type: "string", minLength: 1 },
		reason: { type: "string" },
		message: { type: "string" },
		email: { type: "string", format: "email" },
		version: { type: "string" },
		metadata: { type: "object", additionalProperties: true },
	},
	additionalProperties: false,
} as const;

interface FeedbackBody {
	product: string;
	installId?: string;
	type: string;
	reason?: string;
	message?: string;
	email?: string;
	version?: string;
	metadata?: Record<string, unknown>;
}

export async function feedbackRoutes(app: FastifyInstance) {
	app.post<{ Body: FeedbackBody }>(
		"/v1/feedback",
		{ schema: { body: feedbackBodySchema } },
		async (request, reply) => {
			const {
				product: productKey,
				installId,
				type,
				reason,
				message,
				email,
				version,
				metadata,
			} = request.body;

			// Validate feedback type
			if (!FEEDBACK_TYPES.includes(type as (typeof FEEDBACK_TYPES)[number])) {
				return reply
					.status(400)
					.send({ error: `Invalid feedback type: ${type}` });
			}

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

			// Insert feedback
			const [row] = await db
				.insert(feedback)
				.values({
					productId: product.id,
					installId,
					type,
					reason,
					message,
					email,
					version,
					metadata,
				})
				.returning({ id: feedback.id });

			// Emit event for history consistency
			await db.insert(events).values({
				productId: product.id,
				installId,
				eventName: "feedback_submitted",
				version,
				properties: { type, reason },
			});

			return reply.status(201).send({ ok: true, feedbackId: row.id });
		},
	);
}
