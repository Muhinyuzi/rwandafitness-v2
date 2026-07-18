"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/lib/api";

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: string;
  author_name: string;
  published_at: string;
};

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/articles/${slug}/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load article.");
        }
        return res.json();
      })
      .then((data) => setArticle(data))
      .catch(() => setError("Failed to load article details."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          Loading article...
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || "Article not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/articles"
          className="text-sm font-medium text-primary transition hover:underline"
        >
          ← Back to articles
        </Link>
      </div>

      <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.title}
            className="h-72 w-full object-cover sm:h-96"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500 sm:h-96">
            No cover image
          </div>
        )}

        <div className="p-8 sm:p-10">
          <div className="mb-4 h-1.5 w-16 rounded-full bg-primary" />

          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {article.category}
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {article.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            {article.author_name && <span>By {article.author_name}</span>}
            {article.published_at && (
              <span>{new Date(article.published_at).toLocaleDateString()}</span>
            )}
          </div>

          {article.excerpt && (
            <p className="mt-6 text-lg leading-8 text-zinc-600">
              {article.excerpt}
            </p>
          )}

          <div className="mt-8 border-t border-zinc-200 pt-8">
            <div className="prose prose-zinc max-w-none">
              <p className="whitespace-pre-line leading-8 text-zinc-700">
                {article.content}
              </p>
            </div>
          </div>
        </div>
      </article>

      <section className="mt-10 rounded-3xl border border-zinc-200 bg-primary px-8 py-10 text-center text-white shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight">
          Continue your fitness journey
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
          Explore coaches and gyms on RwandaFitness and take the next step
          toward your goals.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/coaches"
            className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-zinc-100"
          >
            Explore Coaches
          </Link>

          <Link
            href="/gyms"
            className="inline-flex rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Discover Gyms
          </Link>
        </div>
      </section>
    </div>
  );
}