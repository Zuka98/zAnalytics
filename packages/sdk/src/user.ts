import { type UserInfo, getConfig, setUserInfo } from "./config.js";

export interface SetUserOptions {
	uid: string;
	email?: string;
}

export async function setUser(opts: SetUserOptions | null): Promise<void> {
	let config: ReturnType<typeof getConfig>;
	try {
		config = getConfig();
	} catch {
		console.warn(
			"[@zanalytics/sdk] setUser() called before init() — skipped.",
		);
		return;
	}

	if (!opts) {
		setUserInfo(null);
		return;
	}

	const user: UserInfo = { uid: opts.uid, email: opts.email };
	setUserInfo(user);

	if (!config.installId) return;

	try {
		await fetch(`${config.apiUrl}/v1/installs/identify`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				product: config.productKey,
				installId: config.installId,
				userId: opts.uid,
				email: opts.email,
			}),
		});
	} catch (err) {
		console.warn("[@zanalytics/sdk] Failed to identify user:", err);
	}
}
