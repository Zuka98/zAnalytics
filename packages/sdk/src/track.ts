import { getConfig } from "./config.js";

export async function track(
	eventName: string,
	properties?: Record<string, unknown>,
): Promise<void> {
	let config: ReturnType<typeof getConfig>;
	try {
		config = getConfig();
	} catch {
		console.warn(
			`[@zanalytics/sdk] track("${eventName}") called before init() — skipped.`,
		);
		return;
	}

	try {
		await fetch(`${config.apiUrl}/v1/events`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				product: config.productKey,
				installId: config.installId ?? undefined,
				eventName,
				version: config.version,
				properties,
			}),
		});
	} catch (err) {
		console.warn(
			`[@zanalytics/sdk] Failed to track event "${eventName}":`,
			err,
		);
	}
}
