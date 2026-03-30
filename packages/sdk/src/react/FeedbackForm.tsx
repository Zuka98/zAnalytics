import { useState } from "react";
import type { FeedbackType, SubmitFeedbackResult } from "../feedback.js";
import { submitFeedback } from "../feedback.js";

const GENERAL_TYPES: { value: FeedbackType; label: string }[] = [
	{ value: "general", label: "General feedback" },
	{ value: "bug", label: "Bug report" },
	{ value: "feature_request", label: "Feature request" },
];

export interface FeedbackFormProps {
	defaultType?: FeedbackType;
	onSuccess?: (result: SubmitFeedbackResult) => void;
	onError?: (error: string) => void;
	className?: string;
}

export function FeedbackForm({
	defaultType = "general",
	onSuccess,
	onError,
	className,
}: FeedbackFormProps) {
	const [type, setType] = useState<FeedbackType>(defaultType);
	const [message, setMessage] = useState("");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);

		const result = await submitFeedback({
			type,
			message: message.trim() || undefined,
			email: email.trim() || undefined,
		});

		setLoading(false);

		if (result.ok) {
			setSubmitted(true);
			onSuccess?.(result);
		} else {
			onError?.(result.error ?? "Something went wrong");
		}
	}

	if (submitted) {
		return (
			<div className={className} style={styles.container}>
				<p style={styles.successText}>Thanks for your feedback!</p>
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className={className}
			style={styles.container}
		>
			<div style={styles.field}>
				<label htmlFor="za-ff-type" style={styles.label}>
					Type
				</label>
				<select
					id="za-ff-type"
					value={type}
					onChange={(e) => setType(e.target.value as FeedbackType)}
					style={styles.select}
				>
					{GENERAL_TYPES.map((t) => (
						<option key={t.value} value={t.value}>
							{t.label}
						</option>
					))}
				</select>
			</div>

			<div style={styles.field}>
				<label htmlFor="za-ff-message" style={styles.label}>
					Message
				</label>
				<textarea
					id="za-ff-message"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Tell us more..."
					rows={4}
					style={styles.textarea}
				/>
			</div>

			<div style={styles.field}>
				<label htmlFor="za-ff-email" style={styles.label}>
					Email (optional)
				</label>
				<input
					id="za-ff-email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.com"
					style={styles.input}
				/>
			</div>

			<button type="submit" disabled={loading} style={styles.button}>
				{loading ? "Sending…" : "Send feedback"}
			</button>
		</form>
	);
}

const styles = {
	container: {
		display: "flex" as const,
		flexDirection: "column" as const,
		gap: "var(--za-gap, 12px)",
		fontFamily: "var(--za-font, inherit)",
	},
	field: {
		display: "flex" as const,
		flexDirection: "column" as const,
		gap: "4px",
	},
	label: {
		fontSize: "var(--za-label-size, 13px)",
		fontWeight: 500,
		color: "var(--za-text, inherit)",
	},
	select: {
		padding: "var(--za-input-padding, 8px)",
		borderRadius: "var(--za-radius, 6px)",
		border: "1px solid var(--za-border, #d1d5db)",
		background: "var(--za-bg, #fff)",
		color: "var(--za-text, inherit)",
		fontSize: "var(--za-input-size, 14px)",
	},
	textarea: {
		padding: "var(--za-input-padding, 8px)",
		borderRadius: "var(--za-radius, 6px)",
		border: "1px solid var(--za-border, #d1d5db)",
		background: "var(--za-bg, #fff)",
		color: "var(--za-text, inherit)",
		fontSize: "var(--za-input-size, 14px)",
		resize: "vertical" as const,
	},
	input: {
		padding: "var(--za-input-padding, 8px)",
		borderRadius: "var(--za-radius, 6px)",
		border: "1px solid var(--za-border, #d1d5db)",
		background: "var(--za-bg, #fff)",
		color: "var(--za-text, inherit)",
		fontSize: "var(--za-input-size, 14px)",
	},
	button: {
		padding: "var(--za-btn-padding, 8px 16px)",
		borderRadius: "var(--za-radius, 6px)",
		border: "none",
		background: "var(--za-primary, #2563eb)",
		color: "var(--za-primary-text, #fff)",
		fontSize: "var(--za-input-size, 14px)",
		fontWeight: 500,
		cursor: "pointer",
	},
	successText: {
		color: "var(--za-text, inherit)",
		fontSize: "var(--za-input-size, 14px)",
	},
} as const;
