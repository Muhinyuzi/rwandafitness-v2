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
};

export default function FeaturedArticles() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/articles/featured/`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : data.results ?? []);
      })
      .catch(() => setArticles([]));
  }, []);

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900">
            Latest Fitness Articles
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Tips, guides and insights to support your fitness journey.
          </p>
        </div>

        <Link
          href="/articles"
          className="text-sm font-semibold text-primary hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {articles.slice(0, 3).map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {article.cover_image_url ? (
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="h-44 w-full object-cover"
              />
            ) : (
              <div className="flex h-44 items-center justify-center bg-zinc-100 text-sm text-zinc-500">
                No image
              </div>
            )}

            <div className="p-5">
              <span className="text-xs font-semibold text-primary">
                {article.category}
              </span>

              <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                {article.title}
              </h3>

              <p className="mt-2 line-clamp-3 text-sm text-zinc-600">
                {article.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}