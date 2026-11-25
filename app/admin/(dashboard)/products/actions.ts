"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { collectionHandles } from "@/data/catalog";
import { requireAdmin } from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "@/lib/contentStore";
import { saveUploadedImage } from "@/lib/uploads";

const LIST_PATH = "/admin/products";
const KNOWN_COLLECTIONS = new Set(collectionHandles);
const HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DUPLICATE_MESSAGE =
  "A product with that handle already exists in the selected collection.";

type FlashKind = "saved" | "error";

function redirectWithFlash(path: string, kind: FlashKind, message: string): never {
  const params = new URLSearchParams({ [kind]: message });
  redirect(`${path}?${params.toString()}`);
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readImage(formData: FormData): File | null {
  const value = formData.get("image");
  return value instanceof File && value.size > 0 ? value : null;
}

function parseProductId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function parsePriceCents(value: string) {
  const normalized = value.replace(/[$,\s]/g, "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;

  const cents = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isHandleTaken(collectionHandle: string, handle: string, exceptId?: number) {
  return getAllProducts().some(
    (product) =>
      product.id !== exceptId &&
      product.collectionHandle === collectionHandle &&
      product.handle === handle,
  );
}

function isDuplicateProductError(error: unknown) {
  return (
    error instanceof Error &&
    /UNIQUE constraint failed: products\.collection_handle, products\.handle/i.test(
      error.message,
    )
  );
}

function uploadErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "Unable to save the uploaded image.";
}

function readProductFields(formData: FormData) {
  return {
    title: readText(formData, "title"),
    rawHandle: readText(formData, "handle"),
    collectionHandle: readText(formData, "collection"),
    rawPrice: readText(formData, "price"),
    color: readText(formData, "color"),
  };
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const fields = readProductFields(formData);
  if (!fields.title || !fields.collectionHandle || !fields.rawPrice || !fields.color) {
    redirectWithFlash(
      LIST_PATH,
      "error",
      "Title, collection, price, and color are required.",
    );
  }

  if (!KNOWN_COLLECTIONS.has(fields.collectionHandle)) {
    redirectWithFlash(LIST_PATH, "error", "Choose one of the existing collections.");
  }

  const priceCents = parsePriceCents(fields.rawPrice);
  if (priceCents === null) {
    redirectWithFlash(
      LIST_PATH,
      "error",
      "Enter a price greater than $0 with up to two decimals.",
    );
  }

  const handle = slugify(fields.rawHandle || fields.title);
  if (!HANDLE_PATTERN.test(handle)) {
    redirectWithFlash(
      LIST_PATH,
      "error",
      "Handle must contain lowercase letters, numbers, or hyphens.",
    );
  }

  const imageFile = readImage(formData);
  if (!imageFile) {
    redirectWithFlash(
      LIST_PATH,
      "error",
      "Choose a JPEG, PNG, or WebP image for the new product.",
    );
  }

  if (isHandleTaken(fields.collectionHandle, handle)) {
    redirectWithFlash(LIST_PATH, "error", DUPLICATE_MESSAGE);
  }

  let image: string | null = null;
  try {
    image = await saveUploadedImage(imageFile);
  } catch (error) {
    redirectWithFlash(LIST_PATH, "error", uploadErrorMessage(error));
  }

  if (!image) {
    redirectWithFlash(
      LIST_PATH,
      "error",
      "Choose a JPEG, PNG, or WebP image for the new product.",
    );
  }

  try {
    createProduct({
      collectionHandle: fields.collectionHandle,
      handle,
      title: fields.title,
      priceCents,
      color: fields.color,
      image,
    });
  } catch (error) {
    if (isDuplicateProductError(error)) {
      redirectWithFlash(LIST_PATH, "error", DUPLICATE_MESSAGE);
    }
    throw error;
  }

  revalidatePath(`/collections/${fields.collectionHandle}`);
  revalidatePath(LIST_PATH);
  redirectWithFlash(LIST_PATH, "saved", "Product created and published to its collection.");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();

  const id = parseProductId(formData.get("id"));
  const current = id ? getProductById(id) : null;
  if (!current) {
    redirectWithFlash(LIST_PATH, "error", "That product no longer exists.");
  }

  const editPath = `${LIST_PATH}/${current.id}`;
  const fields = readProductFields(formData);
  if (!fields.title || !fields.collectionHandle || !fields.rawPrice || !fields.color) {
    redirectWithFlash(
      editPath,
      "error",
      "Title, collection, price, and color are required.",
    );
  }

  if (!KNOWN_COLLECTIONS.has(fields.collectionHandle)) {
    redirectWithFlash(editPath, "error", "Choose one of the existing collections.");
  }

  const priceCents = parsePriceCents(fields.rawPrice);
  if (priceCents === null) {
    redirectWithFlash(
      editPath,
      "error",
      "Enter a price greater than $0 with up to two decimals.",
    );
  }

  const handle = slugify(fields.rawHandle || fields.title);
  if (!HANDLE_PATTERN.test(handle)) {
    redirectWithFlash(
      editPath,
      "error",
      "Handle must contain lowercase letters, numbers, or hyphens.",
    );
  }

  if (isHandleTaken(fields.collectionHandle, handle, current.id)) {
    redirectWithFlash(editPath, "error", DUPLICATE_MESSAGE);
  }

  const imageFile = readImage(formData);
  let image = current.image;
  if (imageFile) {
    let saved: string | null = null;
    try {
      saved = await saveUploadedImage(imageFile);
    } catch (error) {
      redirectWithFlash(editPath, "error", uploadErrorMessage(error));
    }

    if (!saved) {
      redirectWithFlash(editPath, "error", "Unable to save the uploaded image.");
    }

    image = saved;
  }

  try {
    updateProduct(current.id, {
      collectionHandle: fields.collectionHandle,
      handle,
      title: fields.title,
      priceCents,
      color: fields.color,
      image,
    });
  } catch (error) {
    if (isDuplicateProductError(error)) {
      redirectWithFlash(editPath, "error", DUPLICATE_MESSAGE);
    }
    throw error;
  }

  revalidatePath(`/collections/${current.collectionHandle}`);
  revalidatePath(`/collections/${fields.collectionHandle}`);
  revalidatePath(editPath);
  revalidatePath(LIST_PATH);
  redirectWithFlash(editPath, "saved", "Product saved and published to its collection.");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  const id = parseProductId(formData.get("id"));
  const product = id ? getProductById(id) : null;
  if (!product) {
    redirectWithFlash(LIST_PATH, "error", "That product no longer exists.");
  }

  deleteProduct(product.id);

  revalidatePath(`/collections/${product.collectionHandle}`);
  revalidatePath(LIST_PATH);
  redirectWithFlash(LIST_PATH, "saved", "Product deleted.");
}
