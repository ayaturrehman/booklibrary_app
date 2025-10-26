import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  getChapter,
  updateChapter,
  deleteChapter,
} from "@/lib/database";

const uploadsDir = path.join(process.cwd(), "public", "uploads", "chapters");

async function resolveParams(context) {
  return (await context?.params) || {};
}

function normalizeId(rawValue) {
  const id = Number(rawValue);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export async function GET(_request, context) {
  try {
    const { chapterId: chapterIdRaw } = await resolveParams(context);
    const chapterId = normalizeId(chapterIdRaw);
    if (!chapterId) {
      return NextResponse.json({ error: "Invalid chapter id" }, { status: 400 });
    }

    const chapter = getChapter(chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error("Failed to get chapter", error);
    return NextResponse.json(
      { error: "Failed to get chapter" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    const { chapterId: chapterIdRaw } = await resolveParams(context);
    const chapterId = normalizeId(chapterIdRaw);
    if (!chapterId) {
      return NextResponse.json({ error: "Invalid chapter id" }, { status: 400 });
    }

    const existing = getChapter(chapterId);
    if (!existing) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";
    let title = existing.title;
    let pdfPath = existing.pdf_path;
    let pageCount = existing.page_count;
    let chapterIndex = existing.chapter_index;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const formTitle = formData.get("title");
      const formPageCount = formData.get("pageCount");
      const formChapterIndex = formData.get("chapterIndex");
      const pdfFile = formData.get("pdf");

      if (formTitle !== null) {
        title = formTitle.toString().trim();
      }

      if (formPageCount !== null) {
        const parsed = Number(formPageCount);
        if (Number.isFinite(parsed)) {
          pageCount = parsed;
        }
      }

      if (formChapterIndex !== null) {
        const parsed = Number(formChapterIndex);
        if (Number.isFinite(parsed)) {
          chapterIndex = parsed;
        }
      }

      if (pdfFile && typeof pdfFile.arrayBuffer === "function") {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const originalName = pdfFile.name || "chapter.pdf";
        const sanitizedName = originalName
          .toLowerCase()
          .replace(/[^a-z0-9.]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const fileName = `${Date.now()}-${sanitizedName || "chapter.pdf"}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, buffer);

        // Remove old file if it exists
        if (existing.pdf_path) {
          const previousPath = path.join(process.cwd(), "public", existing.pdf_path);
          if (fs.existsSync(previousPath)) {
            fs.unlinkSync(previousPath);
          }
        }

        pdfPath = path.join("/uploads/chapters", fileName);
      }
    } else {
      const payload = await request.json();
      if (payload?.title !== undefined) {
        title = payload.title.toString().trim();
      }
      if (payload?.pageCount !== undefined) {
        const parsed = Number(payload.pageCount);
        if (Number.isFinite(parsed)) {
          pageCount = parsed;
        }
      }
      if (payload?.chapterIndex !== undefined) {
        const parsed = Number(payload.chapterIndex);
        if (Number.isFinite(parsed)) {
          chapterIndex = parsed;
        }
      }
    }

    if (!title) {
      return NextResponse.json(
        { error: "Chapter title is required" },
        { status: 400 }
      );
    }

    const chapter = updateChapter(chapterId, {
      title,
      pdfPath,
      pageCount,
      chapterIndex,
    });

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error("Failed to update chapter", error);
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, context) {
  try {
    const { chapterId: chapterIdRaw } = await resolveParams(context);
    const chapterId = normalizeId(chapterIdRaw);
    if (!chapterId) {
      return NextResponse.json({ error: "Invalid chapter id" }, { status: 400 });
    }

    const existing = getChapter(chapterId);
    if (!existing) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    deleteChapter(chapterId);

    if (existing.pdf_path) {
      const filePath = path.join(process.cwd(), "public", existing.pdf_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete chapter", error);
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}
