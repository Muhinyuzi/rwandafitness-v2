"use client";

import {useEffect, useState} from "react";
import {useLocale, useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  category: string;
  published_at: string | null;
};

type ArticlesResponse =
  | Article[]
  | {
      results?: Article[];
    };

export default function ArticlesPage() {
  const t = useTranslations("ArticlesPage");
  const locale = useLocale();

  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadArticles() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/articles/?lang=${locale}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load articles");
        }

        const data: ArticlesResponse = await response.json();

        setArticles(
          Array.isArray(data)
            ? data
            : Array.isArray(data.results)
              ? data.results
              : [],
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setError(t("states.error"));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadArticles();

    return () => {
      controller.abort();
    };
  }, [locale, t]);

  function formatPublishedDate(date: string | null) {
    if (!date) {
      return t("article.unknownDate");
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return t("article.unknownDate");
    }

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(parsedDate);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <header className="mb-10 max-w-3xl">
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            {t("header.badge")}
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {t("header.title")}
          </h1>

          <p className="mt-3 text-sm leading-7 text-zinc-500 sm:text-base">
            {t("header.description")}
          </p>
        </header>

        {loading && (
          <div
            role="status"
            className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm"
          >
            {t("states.loading")}
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
            {t("states.empty")}
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {article.cover_image_url ? (
                  <div className="overflow-hidden bg-zinc-100">
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      loading="lazy"
                      className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center bg-zinc-100 px-4 text-center text-sm text-zinc-500">
                    {t("article.noImage")}
                  </div>
                )}

                <article className="p-5">
                  <div className="mb-3 h-1.5 w-14 rounded-full bg-primary" />

                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {article.category}
                  </span>

                  <h2 className="mt-2 text-lg font-semibold text-zinc-900 transition group-hover:text-primary">
                    {article.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">
                    {article.excerpt}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <time
                      dateTime={article.published_at ?? undefined}
                      className="text-xs text-zinc-500"
                    >
                      {formatPublishedDate(article.published_at)}
                    </time>

                    <span className="text-xs font-semibold text-primary">
                      {t("article.readMore")}
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}