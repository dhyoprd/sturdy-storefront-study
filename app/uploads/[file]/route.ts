import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { getUploadDirectory } from "@/lib/uploadPaths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  if (!/^[a-z0-9-]+\.(?:jpg|jpeg|png|webp)$/i.test(file)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await readFile(join(getUploadDirectory(), file));
    return new Response(data, {
      headers: {
        "Content-Type": contentTypes[extname(file).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
