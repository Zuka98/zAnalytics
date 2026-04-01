import { getConfig } from "./config.js";
import { collectContext } from "./context.js";

export const FEEDBACK_TYPES = [
	"uninstall",
	"general",
	"bug",
	"feature_request",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const UNINSTALL_REASONS = [
	{ value: "too_slow", label: "It was too slow" },
	{ value: "missing_features", label: "Missing features I need" },
	{ value: "found_alternative", label: "Found a better alternative" },
	{ value: "no_longer_needed", label: "No longer need it" },
	{ value: "other", label: "Other" },
] as const;

export type UninstallReason = (typeof UNINSTALL_REASONS)[number]["value"];

export interface SubmitFeedbackOptions {
	type: FeedbackType;
	reason?: string;
	message?: string;
	email?: string;
	metadata?: Record<string, unknown>;
}

export interface SubmitFeedbackResult {
	ok: boolean;
	feedbackId?: string;
	error?: string;
}

export async function submitFeedback(
	opts: SubmitFeedbackOptions,
): Promise<SubmitFeedbackResult> {
	let config: ReturnType<typeof getConfig>;
	try {
		config = getConfig();
	} catch {
		return { ok: false, error: "SDK not initialized. Call init() first." };
	}

	try {
		const context = await collectContext();

		const res = await fetch(`${config.apiUrl}/v1/feedback`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				product: config.productKey,
				installId: config.installId ?? undefined,
				version: config.version,
				type: opts.type,
				reason: opts.reason,
				message: opts.message,
				email: opts.email,
				metadata: opts.metadata,
				context,
			}),
		});

		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			return {
				ok: false,
				error: (body as { error?: string }).error ?? `HTTP ${res.status}`,
			};
		}

		const data = (await res.json()) as { ok: boolean; feedbackId?: string };
		return { ok: true, feedbackId: data.feedbackId };
	} catch (err) {
		const message = err instanceof Error ? err.message : "Network error";
		console.warn("[@zanalytics/sdk] Failed to submit feedback:", err);
		return { ok: false, error: message };
	}
}
