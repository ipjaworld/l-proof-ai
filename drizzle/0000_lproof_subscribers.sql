CREATE TABLE `subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`normalized_email` text NOT NULL,
	`name` text,
	`interests` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`consent_version` text NOT NULL,
	`consented_at` text NOT NULL,
	`email_verified_at` text,
	`created_at` text NOT NULL,
	`approved_at` text,
	`rejected_at` text,
	`unsubscribed_at` text,
	`source` text DEFAULT 'landing' NOT NULL,
	`utm_source` text,
	`utm_medium` text,
	`utm_campaign` text,
	`note` text,
	`last_sent_at` text,
	`notification_status` text DEFAULT 'pending' NOT NULL,
	`notification_error` text,
	`last_applied_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_subscribers_normalized_email` ON `subscribers` (`normalized_email`);
--> statement-breakpoint
CREATE INDEX `idx_subscribers_status` ON `subscribers` (`status`);
--> statement-breakpoint
CREATE TABLE `request_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`updated_at` integer NOT NULL
);
