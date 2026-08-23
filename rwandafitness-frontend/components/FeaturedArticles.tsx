"use client";

import {useEffect, useState} from "react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  category: string;
};

type FeaturedArticlesResponse =
  | Article[]
  | {
      results?: Article[];
    };

export default function FeaturedArticles() {
  const locale = useLocale();
  const t = useTranslations("FeaturedArticles");

  const [articles, setArticles] =
    useState<Article[]>([]);

  useEffect(() => {
    const controller =
      new AbortController();

    const loadArticles = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/articles/featured/?lang=${locale}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load featured articles",
          );
        }

        const data: FeaturedArticlesResponse =
          await response.json();

        if (controller.signal.aborted) {
          return;
        }

        setArticles(
          Array.isArray(data)
            ? data
            : Array.isArray(data.results)
              ? data.results
              : [],
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setArticles([]);
      }
    };

    void loadArticles();

    return () => {
      controller.abort();
    };
  }, [locale]);

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            RwandaFitness
          </span>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            {t("title")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {t("description")}
          </p>
        </div>

        <Link
          href="/articles"
          className="shrink-0 text-sm font-semibold text-primary transition hover:underline"
        >
          {t("viewAll")} →
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {articles
          .slice(0, 3)
          .map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {article.cover_image_url ? (
                <div className="overflow-hidden">
                  <img
                    src={
                      article.cover_image_url
                    }
                    alt={
                      article.title
                    }
                    className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center bg-zinc-100 px-4 text-center text-sm text-zinc-500">
                  {t("noImage")}
                </div>
              )}

              <div className="p-5">
                {article.category && (
                  <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    {
                      article.category
                    }
                  </span>
                )}

                <h3 className="mt-3 text-lg font-bold leading-6 text-zinc-900 transition group-hover:text-primary">
                  {
                    article.title
                  }
                </h3>

                {article.excerpt && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
                    {
                      article.excerpt
                    }
                  </p>
                )}

                <p className="mt-4 text-sm font-semibold text-primary">
                  {t("readMore")} →
                </p>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}