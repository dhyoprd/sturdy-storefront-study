"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createHeroSlide,
  deleteHeroSlide,
  getHeroSlide,
  setActiveHero,
  updateAnnouncement,
  updateHeroSlide,
} from "@/lib/contentStore";
import { saveUploadedImage } from "@/lib/uploads";

type FlashKind = "saved" | "error";

function redirectWithFlash(kind: FlashKind, message: string): never {
  const params = new URLSearchParams({ [kind]: message });
  redirect(`/admin/homepage?${params.toString()}`);
}

function revalidateHomepage() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/homepage");
}

function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readImage(formData: FormData, name: string) {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

function localLinkError(href: string, subject: "Announcement" | "Hero") {
  if (!href) return `${subject} link is required.`;
  if (!href.startsWith("/") || href.startsWith("//") || href.includes("\\")) {
    return `${subject} link must be a local path starting with /.`;
  }
  return null;
}

function validHeroId(id: number) {
  return Number.isInteger(id) && id > 0;
}

async function uploadImageOrFlash(file: File | null, required: boolean) {
  if (!file) {
    if (required) redirectWithFlash("error", "Hero image is required.");
    return null;
  }

  let image: string | null = null;
  try {
    image = await saveUploadedImage(file);
  } catch (error) {
    redirectWithFlash(
      "error",
      error instanceof Error && error.message
        ? error.message
        : "Unable to save the uploaded image.",
    );
  }

  if (!image && required) redirectWithFlash("error", "Hero image is required.");
  return image;
}

export async function updateAnnouncementAction(formData: FormData) {
  await requireAdmin();

  const label = readField(formData, "announcement-label");
  const href = readField(formData, "announcement-href");
  const enabled = formData.get("announcement-enabled") === "1";

  if (!label) redirectWithFlash("error", "Announcement label is required.");
  const linkError = localLinkError(href, "Announcement");
  if (linkError) redirectWithFlash("error", linkError);

  updateAnnouncement({ label, href, enabled });
  revalidateHomepage();
  redirectWithFlash("saved", "Announcement saved.");
}

export async function createHeroAction(formData: FormData) {
  await requireAdmin();

  const href = readField(formData, "hero-create-href");
  const alt = readField(formData, "hero-create-alt");
  const active = formData.get("hero-create-active") === "1";

  const linkError = localLinkError(href, "Hero");
  if (linkError) redirectWithFlash("error", linkError);
  if (!alt) redirectWithFlash("error", "Hero title is required.");

  const file = readImage(formData, "hero-create-image");
  const image = await uploadImageOrFlash(file, true);
  if (!image) redirectWithFlash("error", "Hero image is required.");

  createHeroSlide({ image, href, alt, active });
  revalidateHomepage();
  redirectWithFlash("saved", "Hero slide created.");
}

export async function updateHeroAction(id: number, formData: FormData) {
  await requireAdmin();

  if (!validHeroId(id)) redirectWithFlash("error", "Hero slide not found.");
  const slide = getHeroSlide(id);
  if (!slide) redirectWithFlash("error", "Hero slide not found.");

  const href = readField(formData, `hero-href-${id}`);
  const alt = readField(formData, `hero-alt-${id}`);
  const active = formData.get(`hero-active-${id}`) === "1";

  const linkError = localLinkError(href, "Hero");
  if (linkError) redirectWithFlash("error", linkError);
  if (!alt) redirectWithFlash("error", "Hero title is required.");

  const file = readImage(formData, `hero-image-${id}`);
  const uploadedImage = await uploadImageOrFlash(file, false);
  const image = uploadedImage ?? slide.image;

  updateHeroSlide(id, { image, href, alt, active });
  revalidateHomepage();
  redirectWithFlash("saved", "Hero slide updated.");
}

export async function activateHeroAction(id: number) {
  await requireAdmin();

  if (!validHeroId(id)) redirectWithFlash("error", "Hero slide not found.");
  const slide = getHeroSlide(id);
  if (!slide) redirectWithFlash("error", "Hero slide not found.");

  setActiveHero(id);
  revalidateHomepage();
  redirectWithFlash("saved", "Hero slide activated.");
}

export async function deleteHeroAction(id: number) {
  await requireAdmin();

  if (!validHeroId(id)) redirectWithFlash("error", "Hero slide not found.");
  const slide = getHeroSlide(id);
  if (!slide) redirectWithFlash("error", "Hero slide not found.");

  deleteHeroSlide(id);
  revalidateHomepage();
  redirectWithFlash("saved", "Hero slide deleted.");
}
