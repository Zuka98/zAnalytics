export interface UserInfo {
	uid: string;
	email?: string;
}

export interface SdkConfig {
	productKey: string;
	version: string;
	apiUrl: string;
	installId: string | null;
	user: UserInfo | null;
}

let _config: SdkConfig | null = null;

export function setConfig(config: SdkConfig): void {
	_config = config;
}

export function getConfig(): SdkConfig {
	if (!_config) {
		throw new Error(
			"[@zanalytics/sdk] Not initialized. Call init() before using the SDK.",
		);
	}
	return _config;
}

export function setInstallId(installId: string): void {
	if (!_config) return;
	_config.installId = installId;
}

export function setUserInfo(user: UserInfo | null): void {
	if (!_config) return;
	_config.user = user;
}
