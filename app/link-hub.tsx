"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProjectLink } from "./types";

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

export function LinkHub() {
  const [links, setLinks] = useState<ProjectLink[]>([]);
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

    return () => {
      active = false;
    };
  }, []);

  async function sharePage() {
    const shareData = {
      title: "Vibe Archive",
      text: "그동안 만든 바이브코딩 프로젝트를 모아뒀어요.",
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
      <section className="mobile-shell public-shell" aria-label="바이브코딩 링크 모음">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        <header className="profile-header">
          <div className="profile-topbar">
            <span className="tiny-brand">VIBE ARCHIVE</span>
            <button className="circle-button" type="button" onClick={sharePage} aria-label="페이지 공유하기">
              <ShareIcon />
            </button>
          </div>

          <div className="profile-avatar" aria-hidden="true">
            <span>Y</span>
            <i />
          </div>
          <p className="eyebrow">YESEO&apos;S PLAYGROUND</p>
          <h1>바이브로 만든<br />작은 세계들</h1>
          <p className="profile-copy">
            떠오른 아이디어를 일단 만들어본 기록.<br />마음에 드는 프로젝트를 눌러 구경해보세요.
          </p>
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
          <Link href="/admin" aria-label="관리자 페이지로 이동">관리</Link>
        </footer>

        {copied && <div className="toast" role="status">링크를 복사했어요</div>}
      </section>
    </main>
  );
}
