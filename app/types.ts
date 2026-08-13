export type ProjectLink = {
  id: number;
  title: string;
  url: string;
  description: string;
  icon: string;
  color: string;
  position: number;
  createdAt: number;
};

export type SiteSettings = {
  title: string;
  description: string;
  thumbnailUrl: string;
  faviconUrl: string;
  updatedAt: number;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  title: "Vibe Archive",
  description: "그동안 만든 바이브코딩 프로젝트를 한곳에서 만나보세요.",
  thumbnailUrl: "/og.png",
  faviconUrl: "",
  updatedAt: 0,
};
