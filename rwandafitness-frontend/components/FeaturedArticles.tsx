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
};

type FeaturedArticlesResponse =
  | Article[]
  | {results?: Article[]};

export default function FeaturedArticles() {
  const locale = useLocale();
  const t = useTranslations("FeaturedArticles");
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    const loadArticles = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/articles/featured/?lang=${locale}`,
          {signal: controller.signal, cache: "no-store"},
        );

        if (!response.ok) {
          throw new Error("Unable to load featured articles");
        }

        const data: FeaturedArticlesResponse = await response.json();

        if (controller.signal.aborted) return;

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
        if (!controller.signal.aborted) setArticles([]);
      }
    };

    void loadArticles();
    return () => controller.abort();
  }, [locale]);

  if (articles.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#007d36]">
            RwandaFitness
          </span>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#003d24]">
            {t("title")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#52665b]">
            {t("description")}
          </p>
        </div>

        <Link
          href="/articles"
          className="shrink-0 font-serif text-sm font-bold italic text-[#007d36] transition-colors duration-300 hover:text-[#00572f] hover:underline"
        >
          {t("viewAll")} →
        </Link>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {articles.slice(0, 3).map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group overflow-hidden rounded-2xl border border-[#007d36]/15 bg-white shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:border-[#00cfff]/40 hover:ring-[#00cfff]/25 hover:shadow-[0_14px_30px_rgba(0,61,36,0.12)]"
          >
            {article.cover_image_url ? (
              <div className="overflow-hidden bg-[#e7f5ed]">
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center bg-[#e7f5ed] px-4 text-center text-sm text-[#52665b]">
                {t("noImage")}
              </div>
            )}

            <div className="p-5">
              {article.category && (
                <span className="inline-flex rounded-full border border-[#007d36]/15 bg-[#e7f5ed] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#007d36]">
                  {article.category}
                </span>
              )}

              <h3 className="mt-3 text-lg font-bold leading-6 text-[#003d24] transition-colors duration-300 group-hover:text-[#007d36]">
                {article.title}
              </h3>

              {article.excerpt && (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#52665b]">
                  {article.excerpt}
                </p>
              )}

              <p className="mt-4 font-serif text-sm font-bold italic text-[#007d36] transition-colors duration-300 group-hover:text-[#00572f]">
                {t("readMore")} →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
