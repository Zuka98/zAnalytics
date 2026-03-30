export const TYPE_LABEL: Record<string, string> = {
	uninstall: "Uninstall",
	bug: "Bug",
	feature_request: "Feature Request",
	general: "General",
};

export const TYPE_CLASS: Record<string, string> = {
	uninstall: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
	bug: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
	feature_request:
		"bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
	general: "bg-secondary text-secondary-foreground",
};

export const STATUS_CLASS: Record<string, string> = {
	new: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
	reviewed: "bg-secondary text-secondary-foreground",
	in_progress:
		"bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
	resolved:
		"bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
	dismissed: "bg-muted text-muted-foreground",
};

export const EVENT_LABEL: Record<string, string> = {
	uninstall_page_opened: "uninstall",
};

export const EVENT_CLASS: Record<string, string> = {
	install:
		"bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
	uninstall_page_opened:
		"bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
	open: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
	heartbeat:
		"bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
	update:
		"bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
};

// Keep for backward compat in feedback-detail-dialog
export const STATUS_VARIANT: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	new: "outline",
	reviewed: "secondary",
	in_progress: "default",
	resolved: "secondary",
	dismissed: "outline",
};

export const TYPE_VARIANT: Record<
	string,
	"default" | "secondary" | "destructive" | "outline" | "success"
> = {
	uninstall: "destructive",
	bug: "destructive",
	feature_request: "success",
	general: "secondary",
};
