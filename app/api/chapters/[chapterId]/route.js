import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { getChapter, updateChapter, deleteChapter } from "@/lib/db";

const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

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

async function removeBlob(url) {
  if (!url || !blobToken) {
    return;
  }
  try {
    await del(url, { token: blobToken });
  } catch (error) {
    console.warn("Failed to delete blob", error);
  }
}

export async function GET(_request, context) {
  try {
    const { chapterId: chapterIdRaw } = await resolveParams(context);
    const chapterId = normalizeId(chapterIdRaw);
    if (!chapterId) {
      return NextResponse.json({ error: "Invalid chapter id" }, { status: 400 });
    }

    const chapter = await getChapter(chapterId);
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

    const existing = await getChapter(chapterId);
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
        if (!blobToken) {
          return NextResponse.json(
            { error: "File storage is not configured" },
            { status: 500 }
          );
        }

        const arrayBuffer = await pdfFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const originalName = pdfFile.name || "chapter.pdf";
        const sanitizedName = originalName
          .toLowerCase()
          .replace(/[^a-z0-9.]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const blobName = `chapters/${Date.now()}-${sanitizedName || "chapter.pdf"}`;

        const upload = await put(blobName, buffer, {
          access: "public",
          contentType: "application/pdf",
          token: blobToken,
        });

        if (existing.pdf_path && existing.pdf_path !== upload.url) {
          await removeBlob(existing.pdf_path);
        }

        pdfPath = upload.url;
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

    const chapter = await updateChapter(chapterId, {
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

    const existing = await getChapter(chapterId);
    if (!existing) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    await deleteChapter(chapterId);
    await removeBlob(existing.pdf_path);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete chapter", error);
    return NextResponse.json(
      { error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}
