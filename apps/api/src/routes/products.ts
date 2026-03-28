import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { products } from "@zanalytics/db/schema";
import { db } from "../db.js";

export async function productRoutes(app: FastifyInstance) {
	// List all products
	app.get("/v1/products", async () => {
		return db.select().from(products);
	});

	// Get a single product
	app.get<{ Params: { id: string } }>("/v1/products/:id", async (request, reply) => {
		const [product] = await db
			.select()
			.from(products)
			.where(eq(products.id, request.params.id));

		if (!product) {
			return reply.status(404).send({ error: "Product not found" });
		}
		return product;
	});

	// Create a product
	app.post<{
		Body: { key: string; name: string; platform?: string };
	}>("/v1/products", async (request, reply) => {
		const { key, name, platform } = request.body;

		const [product] = await db
			.insert(products)
			.values({ key, name, platform: platform ?? "chrome" })
			.returning();

		return reply.status(201).send(product);
	});
}
