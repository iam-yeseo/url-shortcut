import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "../app/types";

const SETTINGS_ID = 1;

type SiteSettingsRow = {
  title: string;
  description: string;
  thumbnail_url: string;
  favicon_url: string;
  updated_at: number;
};

export async function ensureSiteSettingsTable(d1: D1Database) {
  await d1.prepare(`CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    thumbnail_url TEXT NOT NULL DEFAULT '',
    favicon_url TEXT NOT NULL DEFAULT '',
    updated_at INTEGER NOT NULL
  )`).run();

  await d1.prepare(`INSERT OR IGNORE INTO site_settings
    (id, title, description, thumbnail_url, favicon_url, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(
      SETTINGS_ID,
      DEFAULT_SITE_SETTINGS.title,
      DEFAULT_SITE_SETTINGS.description,
      DEFAULT_SITE_SETTINGS.thumbnailUrl,
      DEFAULT_SITE_SETTINGS.faviconUrl,
      Date.now(),
    )
    .run();
}

export async function getSiteSettings(d1: D1Database): Promise<SiteSettings> {
  const query = () => d1.prepare(`SELECT
      title,
      description,
      thumbnail_url,
      favicon_url,
      updated_at
    FROM site_settings
    WHERE id = ?`)
    .bind(SETTINGS_ID)
    .first<SiteSettingsRow>();

  let settings: SiteSettingsRow | null;
  try {
    settings = await query();
  } catch {
    await ensureSiteSettingsTable(d1);
    settings = await query();
  }

  if (!settings) return DEFAULT_SITE_SETTINGS;
  return {
    title: settings.title,
    description: settings.description,
    thumbnailUrl: settings.thumbnail_url,
    faviconUrl: settings.favicon_url,
    updatedAt: settings.updated_at,
  };
}

export async function updateSiteSettings(
  d1: D1Database,
  settings: Omit<SiteSettings, "updatedAt">,
): Promise<SiteSettings> {
  await ensureSiteSettingsTable(d1);
  const updatedAt = Date.now();
  await d1.prepare(`UPDATE site_settings
    SET title = ?, description = ?, thumbnail_url = ?, favicon_url = ?, updated_at = ?
    WHERE id = ?`)
    .bind(
      settings.title,
      settings.description,
      settings.thumbnailUrl,
      settings.faviconUrl,
      updatedAt,
      SETTINGS_ID,
    )
    .run();

  return { ...settings, updatedAt };
}
