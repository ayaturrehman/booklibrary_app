import { NextResponse } from "next/server";
import { listCategories } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = listCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch public categories", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
