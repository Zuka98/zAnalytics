"use server";

import { db, products } from "@zanalytics/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const KEY_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function getProducts() {
	return db.select().from(products).orderBy(products.createdAt);
}

export async function createProduct(formData: FormData) {
	const key = formData.get("key") as string;
	const name = formData.get("name") as string;
	const platform = (formData.get("platform") as string) || "chrome";

	if (!name?.trim()) {
		return { error: "Name is required" };
	}
	if (!key?.trim() || !KEY_REGEX.test(key)) {
		return { error: "Key must be lowercase alphanumeric with hyphens" };
	}

	try {
		await db.insert(products).values({ key, name: name.trim(), platform });
	} catch (e: unknown) {
		if (e instanceof Error && e.message.includes("unique")) {
			return { error: "A product with this key already exists" };
		}
		return { error: "Failed to create product" };
	}

	revalidatePath("/products");
	return { error: null };
}

export async function updateProduct(id: string, formData: FormData) {
	const key = formData.get("key") as string;
	const name = formData.get("name") as string;
	const platform = (formData.get("platform") as string) || "chrome";

	if (!name?.trim()) {
		return { error: "Name is required" };
	}
	if (!key?.trim() || !KEY_REGEX.test(key)) {
		return { error: "Key must be lowercase alphanumeric with hyphens" };
	}

	try {
		await db
			.update(products)
			.set({ key, name: name.trim(), platform })
			.where(eq(products.id, id));
	} catch (e: unknown) {
		if (e instanceof Error && e.message.includes("unique")) {
			return { error: "A product with this key already exists" };
		}
		return { error: "Failed to update product" };
	}

	revalidatePath("/products");
	return { error: null };
}

export async function deleteProduct(id: string) {
	try {
		await db.delete(products).where(eq(products.id, id));
	} catch {
		return { error: "Failed to delete product" };
	}

	revalidatePath("/products");
	return { error: null };
}
