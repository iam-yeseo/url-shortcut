import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const projectLinks = sqliteTable(
  "project_links",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    description: text("description").notNull().default(""),
    icon: text("icon").notNull().default("🔗"),
    color: text("color").notNull().default("#DDF3C4"),
    position: integer("position").notNull().default(0),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("idx_project_links_position").on(table.position, table.id)],
);

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  thumbnailUrl: text("thumbnail_url").notNull().default(""),
  faviconUrl: text("favicon_url").notNull().default(""),
  updatedAt: integer("updated_at").notNull(),
});
