import { eq } from "drizzle-orm";
import { ensureLinksTable } from "../../../../db/ensure-links";
import { getDb } from "../../../../db";
import { projectLinks } from "../../../../db/schema";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureLinksTable();
    const { id: rawId } = await context.params;
    const id = Number.parseInt(rawId, 10);

    if (!Number.isInteger(id) || id < 1) {
      return Response.json({ error: "올바르지 않은 링크 번호입니다." }, { status: 400 });
    }

    const deleted = await getDb().delete(projectLinks).where(eq(projectLinks.id, id)).returning({ id: projectLinks.id });
    if (deleted.length === 0) return Response.json({ error: "이미 삭제된 링크입니다." }, { status: 404 });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
