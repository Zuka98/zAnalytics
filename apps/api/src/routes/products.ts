import { products } from "@zanalytics/db/schema";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

export async function productRoutes(app: FastifyInstance) {
	// List all products
	app.get("/v1/products", async () => {
		return db.select().from(products);
	});

	// Get a single product
	app.get<{ Params: { id: string } }>(
		"/v1/products/:id",
		async (request, reply) => {
			const [product] = await db
				.select()
				.from(products)
				.where(eq(products.id, request.params.id));

			if (!product) {
				return reply.status(404).send({ error: "Product not found" });
			}
			return product;
		},
	);

	// Create a product
	app.post<{
		Body: { key: string; name: string; platform?: string };
	}>(
		"/v1/products",
		{
			schema: {
				body: {
					type: "object",
					required: ["key", "name"],
					properties: {
						key: { type: "string", minLength: 1 },
						name: { type: "string", minLength: 1 },
						platform: { type: "string", minLength: 1 },
					},
					additionalProperties: false,
				},
			},
		},
		async (request, reply) => {
			const { key, name, platform } = request.body;

			const [existing] = await db
				.select({ id: products.id })
				.from(products)
				.where(eq(products.key, key));

			if (existing) {
				return reply
					.status(409)
					.send({ error: `Product with key "${key}" already exists` });
			}

			const [product] = await db
				.insert(products)
				.values({ key, name, platform: platform ?? "chrome" })
				.returning();

			return reply.status(201).send(product);
		},
	);
}
