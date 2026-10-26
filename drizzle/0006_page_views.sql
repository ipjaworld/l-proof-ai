CREATE TABLE `page_view_daily` (
  `page_key` text NOT NULL,
  `day_kst` text NOT NULL,
  `view_count` integer NOT NULL DEFAULT 0,
  PRIMARY KEY (`page_key`, `day_kst`)
);
