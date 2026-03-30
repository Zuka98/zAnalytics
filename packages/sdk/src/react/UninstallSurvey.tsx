import { useState } from "react";
import type { SubmitFeedbackResult } from "../feedback.js";
import { submitFeedback } from "../feedback.js";

const UNINSTALL_REASONS = [
	{ value: "too_slow", label: "It was too slow" },
	{ value: "missing_features", label: "Missing features I need" },
	{ value: "found_alternative", label: "Found a better alternative" },
	{ value: "no_longer_needed", label: "No longer need it" },
	{ value: "other", label: "Other" },
] as const;

type UninstallReason = (typeof UNINSTALL_REASONS)[number]["value"];

export interface UninstallSurveyProps {
	onSuccess?: (result: SubmitFeedbackResult) => void;
	onError?: (error: string) => void;
	className?: string;
}

export function UninstallSurvey({
	onSuccess,
	onError,
	className,
}: UninstallSurveyProps) {
	const [reason, setReason] = useState<UninstallReason | "">("");
	const [message, setMessage] = useState("");
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);

		const result = await submitFeedback({
			type: "uninstall",
			reason: reason || undefined,
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
				<p style={styles.successText}>
					Thanks for letting us know. Your feedback helps us improve!
				</p>
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className={className}
			style={styles.container}
		>
			<fieldset style={styles.fieldset}>
				<legend style={styles.label}>Why are you uninstalling?</legend>
				<div style={styles.radioGroup}>
					{UNINSTALL_REASONS.map((r) => (
						<label key={r.value} style={styles.radioLabel}>
							<input
								type="radio"
								name="reason"
								value={r.value}
								checked={reason === r.value}
								onChange={() => setReason(r.value)}
								style={styles.radio}
							/>
							{r.label}
						</label>
					))}
				</div>
			</fieldset>

			<div style={styles.field}>
				<label htmlFor="za-us-message" style={styles.label}>
					Anything else? (optional)
				</label>
				<textarea
					id="za-us-message"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					placeholder="Tell us more..."
					rows={3}
					style={styles.textarea}
				/>
			</div>

			<div style={styles.field}>
				<label htmlFor="za-us-email" style={styles.label}>
					Email for follow-up (optional)
				</label>
				<input
					id="za-us-email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.com"
					style={styles.input}
				/>
			</div>

			<button type="submit" disabled={loading} style={styles.button}>
				{loading ? "Sending…" : "Submit"}
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
	fieldset: {
		display: "flex" as const,
		flexDirection: "column" as const,
		gap: "4px",
		border: "none",
		margin: 0,
		padding: 0,
	},
	label: {
		fontSize: "var(--za-label-size, 13px)",
		fontWeight: 500,
		color: "var(--za-text, inherit)",
	},
	radioGroup: {
		display: "flex" as const,
		flexDirection: "column" as const,
		gap: "6px",
	},
	radioLabel: {
		display: "flex" as const,
		alignItems: "center" as const,
		gap: "8px",
		fontSize: "var(--za-input-size, 14px)",
		color: "var(--za-text, inherit)",
		cursor: "pointer",
	},
	radio: {
		accentColor: "var(--za-primary, #2563eb)",
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
