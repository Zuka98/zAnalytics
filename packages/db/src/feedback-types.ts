export const FEEDBACK_TYPES = [
	"uninstall",
	"general",
	"bug",
	"feature_request",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_STATUSES = [
	"new",
	"reviewed",
	"in_progress",
	"resolved",
	"dismissed",
] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];
