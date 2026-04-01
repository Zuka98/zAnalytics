"use server";

import { db, installs } from "@zanalytics/db";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteInstalls(ids: string[]) {
	if (ids.length === 0) return { error: "No installs selected" };

	await db.delete(installs).where(inArray(installs.id, ids));

	revalidatePath("/dashboard");
	return { error: null };
}
