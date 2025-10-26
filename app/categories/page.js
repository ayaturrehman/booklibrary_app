"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const blankForm = { id: null, name: "", description: "" };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedId) || null,
    [categories, selectedId]
  );

  const resetStatus = () => {
    setError("");
    setMessage("");
  };

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Unable to load categories");
      }
      const data = await res.json();
      const list = data.categories || [];
      setCategories(list);
      if (selectedId && !list.some((item) => item.id === selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetStatus();
    if (!form.name.trim()) {
      setError("Category name is required");
      return;
    }
    try {
      setLoading(true);
      const method = form.id ? "PUT" : "POST";
      const url = form.id
        ? `/api/categories/${form.id}`
        : "/api/categories";
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to save category");
      }
      setMessage(form.id ? "Category updated" : "Category created");
      setForm(blankForm);
      await loadCategories();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    resetStatus();
    if (
      !window.confirm(
        "Delete this category? Related books and chapters will also be removed."
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to delete category");
      }
      setMessage("Category deleted");
      if (selectedId === id) {
        setSelectedId(null);
      }
      if (form.id === id) {
        setForm(blankForm);
      }
      await loadCategories();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setForm({
      id: category.id,
      name: category.name,
      description: category.description || "",
    });
    setSelectedId(category.id);
    resetStatus();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-600">
            Create and manage the categories that organize your library.
          </p>
        </div>
        <span className="text-sm text-slate-500">
          {categories.length} total
        </span>
      </div>

      {(error || message) && (
        <div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              {form.id ? "Update Category" : "Create Category"}
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              All fields can be edited later. Names must be unique.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. Science Fiction"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={4}
                  placeholder="Optional description to guide readers"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {form.id ? "Save Changes" : "Add Category"}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={() => setForm(blankForm)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Category List
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Select a category to review associated books and chapters.
            </p>
            <div className="mt-4 space-y-3">
              {categories.map((category) => {
                const active = selectedCategory?.id === category.id;
                return (
                  <article
                    key={category.id}
                    className={`rounded-lg border px-4 py-4 transition ${
                      active
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedId(category.id)}
                          className="text-left text-base font-semibold text-slate-900 hover:underline"
                        >
                          {category.name}
                        </button>
                        {category.description ? (
                          <p className="mt-2 text-sm text-slate-600">
                            {category.description}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-slate-500">
                          {category.bookCount} books · {category.chapterCount} chapters
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
              {!categories.length && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No categories found. Use the form to add your first category.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
