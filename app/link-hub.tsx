"use client";

import { useEffect, useState } from "react";
import type { ProjectLink, SiteSettings } from "./types";

function ArrowUpRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" />
    </svg>
  );
}

export function LinkHub({ initialSettings }: { initialSettings: SiteSettings }) {
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/links", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("목록을 불러오지 못했습니다.");
        return (await response.json()) as { links: ProjectLink[] };
      })
      .then((data) => {
        if (active) setLinks(data.links);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    fetch("/api/settings", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return (await response.json()) as { settings: SiteSettings };
      })
      .then((data) => {
        if (active) setSettings(data.settings);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.title = settings.title;

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute("content", settings.description);

    const currentIcon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!settings.faviconUrl) {
      currentIcon?.remove();
      return;
    }

    const icon = currentIcon ?? document.createElement("link");
    icon.rel = "icon";
    icon.href = settings.faviconUrl;
    if (!currentIcon) document.head.append(icon);
  }, [settings]);

  async function sharePage() {
    const shareData = {
      title: settings.title,
      text: settings.description,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="page-stage">
      <section className="mobile-shell public-shell" aria-label={`${settings.title} 링크 모음`}>
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        <header className="profile-header">
          <div className="profile-topbar">
            <span className="tiny-brand">{settings.title}</span>
            <button className="circle-button" type="button" onClick={sharePage} aria-label="페이지 공유하기">
              <ShareIcon />
            </button>
          </div>
        </header>

        <div className="project-list" aria-live="polite">
          {loading && (
            <div className="loading-list" aria-label="프로젝트를 불러오는 중">
              {[0, 1, 2].map((item) => <div className="link-skeleton" key={item} />)}
            </div>
          )}

          {!loading && error && (
            <div className="empty-card">
              <span>잠시 연결이 끊겼어요</span>
              <p>페이지를 새로고침하면 다시 불러올게요.</p>
            </div>
          )}

          {!loading && !error && links.length === 0 && (
            <div className="empty-card">
              <span>첫 프로젝트를 기다리고 있어요</span>
              <p>관리자 페이지에서 링크를 추가해주세요.</p>
            </div>
          )}

          {!loading && !error && links.map((link, index) => (
            <a
              className="project-card"
              href={link.url}
              key={link.id}
              target="_blank"
              rel="noreferrer"
              style={{ "--delay": `${index * 55}ms` } as React.CSSProperties}
            >
              <span className="project-icon" style={{ background: link.color }} aria-hidden="true">
                {link.icon}
              </span>
              <span className="project-info">
                <strong>{link.title}</strong>
                <small>{link.description || "프로젝트 바로가기"}</small>
              </span>
              <span className="project-arrow"><ArrowUpRight /></span>
            </a>
          ))}
        </div>

        <footer className="public-footer">
          <p>Made with curiosity &amp; a little bit of code.</p>
        </footer>

        {copied && <div className="toast" role="status">링크를 복사했어요</div>}
      </section>
    </main>
  );
}
