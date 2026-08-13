import { getD1 } from ".";

const seedLinks = [
  ["행운의 방", "https://example.com/lucky-room", "코인으로 즐기는 작은 웹 아케이드", "🎰", "#DDF3C4", 0],
  ["서울 버스 도착 알리미", "https://example.com/bus", "정류장 도착 정보를 빠르게 확인해요", "🚌", "#D8E5FA", 1],
  ["모두의 도시여행", "https://example.com/city", "친구들과 가볍게 즐기는 보드게임", "🎲", "#F8D6C3", 2],
] as const;

export async function ensureLinksTable() {
  const d1 = getD1();

  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS project_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT '🔗',
      color TEXT NOT NULL DEFAULT '#DDF3C4',
      position INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )`),
    d1.prepare("CREATE INDEX IF NOT EXISTS idx_project_links_position ON project_links(position, id)"),
  ]);

  const count = await d1.prepare("SELECT COUNT(*) AS count FROM project_links").first<{ count: number }>();
  if (Number(count?.count ?? 0) === 0) {
    const createdAt = Date.now();
    await d1.batch(seedLinks.map((link, index) => d1.prepare(
      "INSERT OR IGNORE INTO project_links (id, title, url, description, icon, color, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(index + 1, ...link, createdAt + index)));
  }
}
