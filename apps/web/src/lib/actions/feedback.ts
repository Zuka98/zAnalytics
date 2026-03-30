"use server";

import { db, FEEDBACK_STATUSES, feedback } from "@zanalytics/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateFeedbackStatus(
	id: string,
	status: string,
	notes?: string,
) {
	if (
		!FEEDBACK_STATUSES.includes(status as (typeof FEEDBACK_STATUSES)[number])
	) {
		return { error: `Invalid status: ${status}` };
	}

	await db
		.update(feedback)
		.set({ status, notes: notes ?? null })
		.where(eq(feedback.id, id));

	revalidatePath("/dashboard");
	return { error: null };
}
