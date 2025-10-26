CREATE TABLE IF NOT EXISTS "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "books" (
  "id" SERIAL PRIMARY KEY,
  "category_id" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "author" TEXT,
  "description" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "books_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "chapters" (
  "id" SERIAL PRIMARY KEY,
  "book_id" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "pdf_path" TEXT NOT NULL,
  "page_count" INTEGER NOT NULL DEFAULT 0,
  "chapter_index" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "chapters_book_id_fkey"
    FOREIGN KEY ("book_id") REFERENCES "books"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "books_category_id_idx" ON "books"("category_id");
CREATE INDEX IF NOT EXISTS "chapters_book_id_idx" ON "chapters"("book_id");
