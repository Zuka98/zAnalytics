import { db, feedback, products } from "@zanalytics/db";
import { count, eq, sql } from "drizzle-orm";

interface GetAllFeedbackOpts {
	productId?: string | null;
	type?: string | null;
	status?: string | null;
	limit: number;
	offset: number;
}

export async function getAllFeedback({
	productId,
	type,
	status,
	limit,
	offset,
}: GetAllFeedbackOpts) {
	const conditions: ReturnType<typeof sql>[] = [];

	if (productId) conditions.push(sql`${feedback.productId} = ${productId}`);
	if (type) conditions.push(sql`${feedback.type} = ${type}`);
	if (status) conditions.push(sql`${feedback.status} = ${status}`);

	const where =
		conditions.length > 0
			? sql`${conditions.reduce((acc, c) => sql`${acc} and ${c}`)}`
			: undefined;

	const base = db
		.select({
			id: feedback.id,
			type: feedback.type,
			status: feedback.status,
			notes: feedback.notes,
			productName: products.name,
			reason: feedback.reason,
			message: feedback.message,
			email: feedback.email,
			metadata: feedback.metadata,
			createdAt: feedback.createdAt,
		})
		.from(feedback)
		.innerJoin(products, sql`${feedback.productId} = ${products.id}`);

	const query = where ? base.where(where) : base;

	const [rows, [{ total }]] = await Promise.all([
		query.orderBy(sql`${feedback.createdAt} desc`).limit(limit).offset(offset),
		db
			.select({ total: count() })
			.from(feedback)
			.innerJoin(products, sql`${feedback.productId} = ${products.id}`)
			.where(where ?? sql`true`),
	]);

	return { rows, total: Number(total) };
}

export async function getFeedbackProducts() {
	return db
		.select({ id: products.id, name: products.name })
		.from(products)
		.orderBy(products.name);
}
