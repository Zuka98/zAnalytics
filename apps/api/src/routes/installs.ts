import { installs, products } from "@zanalytics/db/schema";
import { and, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

const identifyBodySchema = {
	type: "object",
	required: ["product", "installId"],
	properties: {
		product: { type: "string", minLength: 1 },
		installId: { type: "string", format: "uuid" },
		userId: { type: "string", minLength: 1 },
		email: { type: "string" },
	},
	additionalProperties: false,
} as const;

interface IdentifyBody {
	product: string;
	installId: string;
	userId?: string;
	email?: string;
}

export async function installRoutes(app: FastifyInstance) {
	app.post<{ Body: IdentifyBody }>(
		"/v1/installs/identify",
		{
			schema: { body: identifyBodySchema },
			config: {
				rateLimit: {
					max: 30,
					timeWindow: "1 minute",
				},
			},
		},
		async (request, reply) => {
			const { product: productKey, installId, userId, email } = request.body;

			if (!userId && !email) {
				return reply
					.status(400)
					.send({ error: "At least one of userId or email is required" });
			}

			const [product] = await db
				.select()
				.from(products)
				.where(eq(products.key, productKey));

			if (!product) {
				return reply
					.status(400)
					.send({ error: `Unknown product: ${productKey}` });
			}

			await db
				.update(installs)
				.set({
					...(userId && { linkedUserId: userId }),
					...(email && { linkedUserEmail: email }),
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(installs.productId, product.id),
						eq(installs.installId, installId),
					),
				);

			return reply.status(200).send({ ok: true });
		},
	);
}
