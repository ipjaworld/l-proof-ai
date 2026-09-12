ALTER TABLE `subscribers` ADD `notification_last_attempt_at` text;
--> statement-breakpoint
ALTER TABLE `subscribers` ADD `notification_attempts` integer DEFAULT 0 NOT NULL;
