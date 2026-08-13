"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { ProjectLink } from "../types";

const colors = ["#DDF3C4", "#F8D6C3", "#D8E5FA", "#F5E2A8", "#E4D7F8"];

function BackIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>;
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
    </svg>
  );
}

export function AdminPanel() {
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [color, setColor] = useState(colors[0]);

  useEffect(() => {
    let active = true;

    fetch("/api/links", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return (await response.json()) as { links: ProjectLink[] };
      })
      .then((data) => {
        if (active) {
          setLinks(data.links);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("링크 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function addLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          url: formData.get("url"),
          description: formData.get("description"),
          icon: formData.get("icon"),
          color,
        }),
      });

      const data = (await response.json()) as { link?: ProjectLink; error?: string };
      if (!response.ok || !data.link) throw new Error(data.error || "저장하지 못했어요.");

      setLinks((current) => [...current, data.link as ProjectLink]);
      form.reset();
      setColor(colors[0]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "링크를 저장하지 못했어요.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteLink(link: ProjectLink) {
    if (!window.confirm(`‘${link.title}’ 링크를 삭제할까요?`)) return;

    setDeletingId(link.id);
    setError("");

    try {
      const response = await fetch(`/api/links/${link.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("링크를 삭제하지 못했어요.");
      setLinks((current) => current.filter((item) => item.id !== link.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "링크를 삭제하지 못했어요.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="page-stage">
      <section className="mobile-shell admin-shell">
        <header className="admin-topbar">
          <Link className="back-link" href="/" aria-label="메인 페이지로 돌아가기"><BackIcon /></Link>
          <span className="admin-badge">ADMIN</span>
        </header>

        <div className="admin-heading">
          <p>LINK MANAGER</p>
          <h1>프로젝트 링크 관리</h1>
          <span>새로운 작업을 추가하거나 더 이상<br />보여주지 않을 링크를 정리할 수 있어요.</span>
        </div>

        <section className="admin-card" aria-labelledby="add-link-title">
          <h2 id="add-link-title">새 링크 추가</h2>
          <form className="admin-form" onSubmit={addLink}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="icon">아이콘</label>
                <input id="icon" name="icon" maxLength={8} placeholder="🚀" aria-label="링크 아이콘 이모지" />
              </div>
              <div className="field">
                <label htmlFor="title">프로젝트 이름 *</label>
                <input id="title" name="title" required maxLength={60} placeholder="나의 새 프로젝트" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="url">링크 주소 *</label>
              <input id="url" name="url" required type="url" inputMode="url" placeholder="https://example.com" />
            </div>

            <div className="field">
              <label htmlFor="description">짧은 설명</label>
              <textarea id="description" name="description" maxLength={120} placeholder="어떤 프로젝트인지 한 줄로 소개해주세요." />
            </div>

            <fieldset className="field color-fieldset">
              <legend>아이콘 배경색</legend>
              <div className="color-options">
                {colors.map((item) => (
                  <label className="color-choice" key={item} style={{ "--choice": item } as React.CSSProperties}>
                    <input
                      type="radio"
                      name="color"
                      value={item}
                      checked={color === item}
                      onChange={() => setColor(item)}
                      aria-label={`${item} 색상`}
                    />
                    <span />
                  </label>
                ))}
              </div>
            </fieldset>

            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="submit-button" type="submit" disabled={saving}>
              {saving ? "저장하는 중..." : "+ 링크 추가하기"}
            </button>
          </form>
        </section>

        <section className="saved-section" aria-labelledby="saved-links-title">
          <div className="saved-title">
            <h2 id="saved-links-title">등록된 링크</h2>
            <span>{loading ? "불러오는 중" : `총 ${links.length}개`}</span>
          </div>

          <div className="admin-list">
            {!loading && links.length === 0 && <div className="empty-card"><span>아직 링크가 없어요</span></div>}
            {links.map((link) => (
              <article className="admin-item" key={link.id}>
                <span className="admin-item-icon" style={{ background: link.color }} aria-hidden="true">{link.icon}</span>
                <span className="admin-item-copy">
                  <strong>{link.title}</strong>
                  <small>{link.url}</small>
                </span>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteLink(link)}
                  disabled={deletingId === link.id}
                  aria-label={`${link.title} 삭제`}
                >
                  <TrashIcon />
                </button>
              </article>
            ))}
          </div>
        </section>

        <p className="admin-note">현재는 기본 관리 틀입니다. 실제 공개 운영 전에는<br />관리자 로그인 보호 기능을 추가하는 것을 권장해요.</p>
      </section>
    </main>
  );
}
