"use server";

import { db, events } from "@zanalytics/db";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function deleteEvents(ids: string[]) {
	if (ids.length === 0) return { error: "No events selected" };

	await db.delete(events).where(inArray(events.id, ids));

	revalidatePath("/dashboard");
	return { error: null };
}
