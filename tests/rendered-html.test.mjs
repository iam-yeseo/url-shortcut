import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the public link hub", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Vibe Archive<\/title>/i);
  assert.match(html, /Vibe Archive/);
  assert.doesNotMatch(html, /<h1[\s>]/i);
  assert.doesNotMatch(html, /profile-avatar/);
  assert.doesNotMatch(html, /href="\/admin"/i);
  assert.doesNotMatch(html, /떠오른 아이디어를 일단 만들어본 기록/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders the separate admin route", async () => {
  const response = await render("/admin");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /플레이그라운드 관리/);
  assert.match(html, /사이트 정보 저장하기/);
  assert.match(html, /공유 썸네일 주소/);
  assert.match(html, /파비콘 주소/);
  assert.match(html, /새 링크 추가/);
});
