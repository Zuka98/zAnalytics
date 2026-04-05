import { getConfig, setConfig, setInstallId } from "./config.js";
import { trackInstall } from "./lifecycle.js";
import { chromeStorageAdapter, type StorageAdapter } from "./storage.js";

const INSTALL_ID_KEY = "za_install_id";

export interface InitOptions {
	productKey: string;
	version: string;
	apiUrl: string;
	storage?: StorageAdapter;
}

export async function init(opts: InitOptions): Promise<void> {
	const storage = opts.storage ?? chromeStorageAdapter;

	setConfig({
		productKey: opts.productKey,
		version: opts.version,
		apiUrl: opts.apiUrl.replace(/\/$/, ""),
		installId: null,
		user: null,
	});

	let installId = await storage.get(INSTALL_ID_KEY);
	const isFirstInstall = installId === null;

	if (installId === null) {
		installId = crypto.randomUUID();
		await storage.set(INSTALL_ID_KEY, installId);
	}

	setInstallId(installId);

	if (isFirstInstall) {
		await trackInstall();
	}
}

export function getInstallId(): string {
	const config = getConfig();
	if (!config.installId) {
		throw new Error(
			"[@zanalytics/sdk] installId not yet set. Await init() before calling getInstallId().",
		);
	}
	return config.installId;
}
