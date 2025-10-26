import Link from "next/link";
import {
  countCategories,
  countBooks,
  countChapters,
  listCategories,
  getRecentBooks,
  getRecentChapters,
} from "@/lib/database";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const categories = listCategories();
  const totalCategories = countCategories();
  const totalBooks = countBooks();
  const totalChapters = countChapters();
  const recentBooks = getRecentBooks(5);
  const recentChapters = getRecentChapters(5);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Categories"
          value={totalCategories}
          href="/categories"
          description="Organize the library by subject or type."
        />
        <StatCard
          title="Books"
          value={totalBooks}
          href="/books"
          description="Create book entries and assign them to categories."
        />
        <StatCard
          title="Chapters"
          value={totalChapters}
          href="/chapters"
          description="Upload PDFs for individual chapters."
        />
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Quick Actions
          </h3>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link
              href="/categories"
              className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 font-medium text-blue-700 transition hover:bg-blue-100"
            >
              Create category
            </Link>
            <Link
              href="/books"
              className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              Add new book
            </Link>
            <Link
              href="/chapters"
              className="rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2 font-medium text-indigo-700 transition hover:bg-indigo-100"
            >
              Upload chapter PDF
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Categories</h2>
            <Link
              href="/categories"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Manage
            </Link>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Track how your content is organized.
          </p>
          <ul className="mt-4 space-y-3">
            {categories.slice(0, 6).map((category) => (
              <li
                key={category.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">
                    {category.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {category.bookCount} books · {category.chapterCount} chapters
                  </span>
                </div>
                {category.description ? (
                  <p className="mt-1 text-xs text-slate-600">
                    {category.description}
                  </p>
                ) : null}
              </li>
            ))}
            {!categories.length && (
              <li className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                No categories yet. Get started by creating one.
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Books
              </h2>
              <Link
                href="/books"
                className="text-sm font-medium text-emerald-600 hover:underline"
              >
                Manage
              </Link>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {recentBooks.length ? (
                recentBooks.map((book) => (
                  <li
                    key={book.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">
                        {book.title}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-slate-500">
                        {book.category_name || "Unassigned"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {book.author ? `Author: ${book.author}` : "No author"}
                    </p>
                  </li>
                ))
              ) : (
                <li className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  No books yet. Add one from the books page.
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Chapters
              </h2>
              <Link
                href="/chapters"
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                Manage
              </Link>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {recentChapters.length ? (
                recentChapters.map((chapter) => (
                  <li
                    key={chapter.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">
                        {chapter.title}
                      </span>
                      <span className="text-xs uppercase tracking-wide text-slate-500">
                        {chapter.category_name || "Unassigned"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Book: {chapter.book_title || "Unknown"} · Order:{" "}
                      {chapter.chapter_index ?? "—"}
                    </p>
                  </li>
                ))
              ) : (
                <li className="rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  No chapters yet. Upload one from the chapters page.
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, description, href }) {
  return (
    <Link href={href}>
      <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        <p className="mt-3 text-xs text-slate-500">{description}</p>
      </div>
    </Link>
  );
}
