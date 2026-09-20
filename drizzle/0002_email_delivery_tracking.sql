ALTER TABLE `subscribers` ADD `notification_email_id` text;
--> statement-breakpoint
ALTER TABLE `subscribers` ADD `notification_delivery_status` text;
--> statement-breakpoint
ALTER TABLE `subscribers` ADD `notification_delivered_at` text;
--> statement-breakpoint
ALTER TABLE `subscribers` ADD `notification_bounced_at` text;
--> statement-breakpoint
ALTER TABLE `subscribers` ADD `notification_complained_at` text;
--> statement-breakpoint
ALTER TABLE `subscribers` ADD `notification_event_updated_at` text;
--> statement-breakpoint
CREATE TABLE `email_delivery_events` (
	`id` text PRIMARY KEY NOT NULL,
	`email_id` text NOT NULL,
	`type` text NOT NULL,
	`recipient` text,
	`event_created_at` text NOT NULL,
	`received_at` text NOT NULL,
	`payload` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_email_delivery_events_email_id` ON `email_delivery_events` (`email_id`);
--> statement-breakpoint
CREATE INDEX `idx_email_delivery_events_type` ON `email_delivery_events` (`type`);
