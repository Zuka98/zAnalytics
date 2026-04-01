ALTER TABLE "events" ADD COLUMN "context" jsonb;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "context" jsonb;--> statement-breakpoint
ALTER TABLE "installs" ADD COLUMN "os" text;--> statement-breakpoint
ALTER TABLE "installs" ADD COLUMN "browser_version" text;--> statement-breakpoint
ALTER TABLE "installs" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "installs" ADD COLUMN "context" jsonb;