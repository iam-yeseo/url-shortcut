CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`thumbnail_url` text DEFAULT '' NOT NULL,
	`favicon_url` text DEFAULT '' NOT NULL,
	`updated_at` integer NOT NULL
);
