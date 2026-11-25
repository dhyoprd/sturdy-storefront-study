import { NextResponse } from "next/server";
import { searchProductCards } from "@/lib/contentStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  if (query.length < 1) {
    return NextResponse.json({ products: [] });
  }

  const rawLimit = params.get("limit")?.trim() ?? "";
  const parsedLimit = rawLimit ? Number(rawLimit) : Number.NaN;
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(48, Math.max(1, Math.floor(parsedLimit)))
    : 12;

  return NextResponse.json({ products: searchProductCards(query, limit) });
}
