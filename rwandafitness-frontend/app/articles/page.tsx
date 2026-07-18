"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/api";

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  category: string;
  published_at: string;
};

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/articles/`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : data.results ?? []);
      })
      .catch(() => setError("Failed to load articles."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
          RwandaFitness
        </span>

        <h1 className="mt-4 text-3xl font-bold text-zinc-900">
          Fitness Articles
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Tips, guides and insights to improve your fitness journey.
        </p>
      </div>

      {loading && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          Loading articles...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          No articles available yet.
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {article.cover_image_url ? (
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="h-48 w-full object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center bg-zinc-100 text-sm text-zinc-500">
                  No image
                </div>
              )}

              <div className="p-5">
                <div className="mb-3 h-1.5 w-14 rounded-full bg-primary" />

                <span className="text-xs font-semibold text-primary">
                  {article.category}
                </span>

                <h2 className="mt-2 text-lg font-semibold text-zinc-900">
                  {article.title}
                </h2>

                <p className="mt-2 text-sm text-zinc-600 line-clamp-3">
                  {article.excerpt}
                </p>

                <p className="mt-3 text-xs text-zinc-500">
                  {new Date(article.published_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}