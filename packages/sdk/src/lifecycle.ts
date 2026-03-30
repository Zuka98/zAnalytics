import { track } from "./track.js";

export async function trackInstall(): Promise<void> {
	await track("install");
}

export async function trackOpen(): Promise<void> {
	await track("open");
}

export async function trackUpdate(previousVersion: string): Promise<void> {
	await track("update", { previousVersion });
}
