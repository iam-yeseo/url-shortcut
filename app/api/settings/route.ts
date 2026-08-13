import { getSiteSettings, updateSiteSettings } from "../../../db/site-settings";
import { env } from "cloudflare:workers";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
}

function normalizeImageUrl(value: unknown, label: string) {
  const input = typeof value === "string" ? value.trim().slice(0, 2048) : "";
  if (!input) return "";

  if (input.startsWith("/") && !input.startsWith("//")) return input;

  try {
    const url = new URL(input);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    return url.toString();
  } catch {
    throw new Error(`${label}는 http 또는 https 주소나 /로 시작하는 경로를 입력해주세요.`);
  }
}

export async function GET() {
  try {
    const settings = await getSiteSettings(env.DB);
    return Response.json({ settings }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const title = typeof payload.title === "string" ? payload.title.trim().slice(0, 70) : "";
    const description = typeof payload.description === "string" ? payload.description.trim().slice(0, 180) : "";

    if (!title) {
      return Response.json({ error: "웹 제목을 입력해주세요." }, { status: 400 });
    }

    const settings = await updateSiteSettings(env.DB, {
      title,
      description,
      thumbnailUrl: normalizeImageUrl(payload.thumbnailUrl, "썸네일 주소"),
      faviconUrl: normalizeImageUrl(payload.faviconUrl, "파비콘 주소"),
    });

    return Response.json({ settings }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
