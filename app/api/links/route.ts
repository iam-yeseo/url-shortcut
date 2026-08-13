import { asc } from "drizzle-orm";
import { ensureLinksTable } from "../../../db/ensure-links";
import { getD1, getDb } from "../../../db";
import { projectLinks } from "../../../db/schema";

const allowedColors = new Set(["#DDF3C4", "#F8D6C3", "#D8E5FA", "#F5E2A8", "#E4D7F8"]);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
}

export async function GET() {
  try {
    await ensureLinksTable();
    const links = await getDb().select().from(projectLinks).orderBy(asc(projectLinks.position), asc(projectLinks.id));
    return Response.json({ links });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureLinksTable();
    const payload = (await request.json()) as Record<string, unknown>;
    const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 60) : "";
    const description = typeof payload.description === "string" ? payload.description.trim().slice(0, 120) : "";
    const icon = typeof payload.icon === "string" && payload.icon.trim() ? payload.icon.trim().slice(0, 8) : "🔗";
    const color = typeof payload.color === "string" && allowedColors.has(payload.color) ? payload.color : "#DDF3C4";
    let url: URL;

    if (!title) return Response.json({ error: "프로젝트 이름을 입력해주세요." }, { status: 400 });

    try {
      url = new URL(typeof payload.url === "string" ? payload.url.trim() : "");
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      return Response.json({ error: "http 또는 https로 시작하는 올바른 주소를 입력해주세요." }, { status: 400 });
    }

    const maxRow = await getD1().prepare("SELECT COALESCE(MAX(position), -1) AS max_position FROM project_links").first<{ max_position: number }>();
    const [link] = await getDb().insert(projectLinks).values({
      title,
      url: url.toString(),
      description,
      icon,
      color,
      position: Number(maxRow?.max_position ?? -1) + 1,
      createdAt: Date.now(),
    }).returning();

    return Response.json({ link }, { status: 201 });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}
