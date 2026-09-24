CREATE TABLE `briefing_editions` (
	`id` text PRIMARY KEY NOT NULL,
	`subject` text NOT NULL,
	`preview_text` text NOT NULL,
	`content_text` text NOT NULL,
	`content_html` text NOT NULL,
	`content_hash` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`review_due_at` text NOT NULL,
	`scheduled_send_at` text NOT NULL,
	`approval_token_hash` text NOT NULL,
	`review_email_id` text,
	`review_sent_at` text,
	`approved_at` text,
	`approved_content_hash` text,
	`held_at` text,
	`send_started_at` text,
	`sent_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_briefing_editions_status_schedule` ON `briefing_editions` (`status`,`scheduled_send_at`);
--> statement-breakpoint
CREATE TABLE `briefing_deliveries` (
	`id` text PRIMARY KEY NOT NULL,
	`edition_id` text NOT NULL,
	`subscriber_id` text NOT NULL,
	`recipient` text NOT NULL,
	`email_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`error` text,
	`sent_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`edition_id`) REFERENCES `briefing_editions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_briefing_deliveries_edition_subscriber` ON `briefing_deliveries` (`edition_id`,`subscriber_id`);
--> statement-breakpoint
CREATE INDEX `idx_briefing_deliveries_email_id` ON `briefing_deliveries` (`email_id`);
