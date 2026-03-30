export interface StorageAdapter {
	get(key: string): Promise<string | null>;
	set(key: string, value: string): Promise<void>;
}

export const chromeStorageAdapter: StorageAdapter = {
	async get(key: string): Promise<string | null> {
		const result = await chrome.storage.local.get(key);
		return (result[key] as string | undefined) ?? null;
	},
	async set(key: string, value: string): Promise<void> {
		await chrome.storage.local.set({ [key]: value });
	},
};
