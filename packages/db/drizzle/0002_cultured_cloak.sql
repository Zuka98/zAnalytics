CREATE INDEX "idx_events_product_id" ON "events" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_events_occurred_at" ON "events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "idx_events_product_occurred" ON "events" USING btree ("product_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_events_event_name" ON "events" USING btree ("event_name");--> statement-breakpoint
CREATE INDEX "idx_installs_status" ON "installs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_installs_product_id" ON "installs" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_installs_product_status" ON "installs" USING btree ("product_id","status");--> statement-breakpoint
CREATE INDEX "idx_installs_first_seen_at" ON "installs" USING btree ("first_seen_at");