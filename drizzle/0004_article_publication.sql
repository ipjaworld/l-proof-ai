ALTER TABLE `briefing_editions` ADD `edition_number` integer;
--> statement-breakpoint
ALTER TABLE `briefing_editions` ADD `slug` text;
--> statement-breakpoint
ALTER TABLE `briefing_editions` ADD `proof_level` integer DEFAULT 3 NOT NULL;
--> statement-breakpoint
ALTER TABLE `briefing_editions` ADD `tags` text DEFAULT '[]' NOT NULL;
--> statement-breakpoint
ALTER TABLE `briefing_editions` ADD `hero_image_url` text;
--> statement-breakpoint
ALTER TABLE `briefing_editions` ADD `publication_status` text DEFAULT 'unpublished' NOT NULL;
--> statement-breakpoint
ALTER TABLE `briefing_editions` ADD `scheduled_publish_at` text;
--> statement-breakpoint
ALTER TABLE `briefing_editions` ADD `published_at` text;
--> statement-breakpoint
ALTER TABLE `briefing_editions` ADD `publication_error` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_briefing_editions_slug` ON `briefing_editions` (`slug`);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_briefing_editions_number` ON `briefing_editions` (`edition_number`);
--> statement-breakpoint
CREATE INDEX `idx_briefing_editions_publication_schedule` ON `briefing_editions` (`publication_status`,`scheduled_publish_at`);
