export type {
	FeedbackType,
	SubmitFeedbackOptions,
	SubmitFeedbackResult,
} from "./feedback.js";
export { FEEDBACK_TYPES, submitFeedback } from "./feedback.js";
export type { InitOptions } from "./init.js";
export { getInstallId, init } from "./init.js";
export { trackInstall, trackOpen, trackUpdate } from "./lifecycle.js";
export type { StorageAdapter } from "./storage.js";

export { chromeStorageAdapter } from "./storage.js";
export { track } from "./track.js";
