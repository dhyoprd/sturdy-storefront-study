import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { getUploadDirectory } from "@/lib/uploadPaths";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const imageTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function hasExpectedSignature(bytes: Uint8Array, mime: string) {
  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mime === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }

  if (mime === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}

export async function saveUploadedImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const extension = imageTypes[file.type];
  if (!extension) {
    throw new Error("Image must be JPEG, PNG, or WebP.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length < 12 || !hasExpectedSignature(bytes, file.type)) {
    throw new Error("Uploaded file is not a valid image.");
  }

  const directory = getUploadDirectory();
  await mkdir(directory, { recursive: true });

  const filename = `${randomUUID()}${extension}`;
  await writeFile(join(directory, filename), bytes);
  return `/uploads/${filename}`;
}
