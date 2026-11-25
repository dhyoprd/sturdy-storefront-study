import { tmpdir } from "node:os";
import { join } from "node:path";

export function getUploadDirectory() {
  return process.env.VERCEL
    ? join(tmpdir(), "uploads")
    : join(process.cwd(), "public", "uploads");
}
