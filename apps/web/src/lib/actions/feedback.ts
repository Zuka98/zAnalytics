"use server";

import { db, FEEDBACK_STATUSES, feedback } from "@zanalytics/db";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateFeedbackStatus(id: string, status: string) {
	if (
		!FEEDBACK_STATUSES.includes(status as (typeof FEEDBACK_STATUSES)[number])
	) {
		return { error: `Invalid status: ${status}` };
	}

	await db.update(feedback).set({ status }).where(eq(feedback.id, id));

	revalidatePath("/dashboard");
	revalidatePath("/feedback");
	return { error: null };
}

export async function updateFeedbackNotes(id: string, notes: string) {
	await db
		.update(feedback)
		.set({ notes: notes.trim() || null })
		.where(eq(feedback.id, id));

	revalidatePath("/dashboard");
	revalidatePath("/feedback");
	return { error: null };
}

export async function deleteFeedback(ids: string[]) {
	if (ids.length === 0) return { error: "No feedback selected" };

	await db.delete(feedback).where(inArray(feedback.id, ids));

	revalidatePath("/dashboard");
	revalidatePath("/feedback");
	return { error: null };
}
