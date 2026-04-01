interface NavigatorUABrand {
	brand: string;
	version: string;
}

interface NavigatorUAData {
	brands: NavigatorUABrand[];
	mobile: boolean;
	platform: string;
}

declare global {
	interface Navigator {
		userAgentData?: NavigatorUAData;
		deviceMemory?: number;
		connection?: { effectiveType?: string };
	}
}

export interface Context {
	locale: string;
	languages: string[];
	timezone: string;
	os: string;
	arch: string;
	platform: string;
	mobile: boolean;
	memory: number | undefined;
	cores: number;
	touchPoints: number;
	screenWidth: number;
	screenHeight: number;
	pixelRatio: number;
	colorDepth: number;
	browser: string;
	browserVersion: string;
	connectionType: string | undefined;
}

function getBrowser(): { browser: string; browserVersion: string } {
	try {
		const brands = navigator.userAgentData?.brands;
		if (brands) {
			const brand = brands.find(
				(b) => b.brand !== "Chromium" && !b.brand.includes("Not"),
			);
			if (brand) return { browser: brand.brand, browserVersion: brand.version };
			const chromium = brands.find((b) => b.brand === "Chromium");
			if (chromium)
				return { browser: chromium.brand, browserVersion: chromium.version };
		}
	} catch {}
	return { browser: "unknown", browserVersion: "unknown" };
}

export async function collectContext(): Promise<Context> {
	let os = "unknown";
	let arch = "unknown";
	try {
		const info = await chrome.runtime.getPlatformInfo();
		os = info.os;
		arch = info.arch;
	} catch {}

	const { browser, browserVersion } = getBrowser();

	return {
		locale: navigator.language,
		languages: [...navigator.languages],
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		os,
		arch,
		platform: navigator.userAgentData?.platform ?? "unknown",
		mobile: navigator.userAgentData?.mobile ?? false,
		memory: navigator.deviceMemory,
		cores: navigator.hardwareConcurrency,
		touchPoints: navigator.maxTouchPoints,
		screenWidth: screen.width,
		screenHeight: screen.height,
		pixelRatio: window.devicePixelRatio,
		colorDepth: screen.colorDepth,
		browser,
		browserVersion,
		connectionType: navigator.connection?.effectiveType,
	};
}
