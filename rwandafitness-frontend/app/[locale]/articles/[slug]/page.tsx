"use client";

import {useEffect, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useParams} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: string;
  author_name: string;
  published_at: string | null;
};

export default function ArticleDetailPage() {
  const params = useParams<{slug: string}>();
  const slug = params.slug;

  const t = useTranslations("ArticleDetailPage");
  const locale = useLocale();

  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadArticle() {
      try {
        setLoading(true);
        setError("");
        setArticle(null);

        const response = await fetch(
          `${API_URL}/api/articles/${encodeURIComponent(slug)}/?lang=${locale}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("ARTICLE_NOT_FOUND");
          }

          throw new Error("ARTICLE_LOAD_FAILED");
        }

        const data: Article = await response.json();

        if (!controller.signal.aborted) {
          setArticle(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        if (error instanceof Error && error.message === "ARTICLE_NOT_FOUND") {
          setError(t("states.notFound"));
        } else {
          setError(t("states.error"));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadArticle();

    return () => {
      controller.abort();
    };
  }, [slug, locale, t]);

  function formatPublishedDate(date: string | null) {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(parsedDate);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-4xl px-6 py-10">
          <div
            role="status"
            className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm"
          >
            {t("states.loading")}
          </div>
        </main>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-4xl px-6 py-10">
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error || t("states.notFound")}
          </div>

          <Link
            href="/articles"
            className="mt-6 inline-flex text-sm font-semibold text-primary transition hover:underline"
          >
            {t("navigation.back")}
          </Link>
        </main>
      </div>
    );
  }

  const publishedDate = formatPublishedDate(article.published_at);

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <div className="mb-6">
          <Link
            href="/articles"
            className="text-sm font-medium text-primary transition hover:underline"
          >
            {t("navigation.back")}
          </Link>
        </div>

        <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          {article.cover_image_url ? (
            <div className="overflow-hidden bg-zinc-100">
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="h-72 w-full object-cover sm:h-96"
              />
            </div>
          ) : (
            <div className="flex h-72 w-full items-center justify-center bg-zinc-100 px-4 text-center text-sm text-zinc-500 sm:h-96">
              {t("article.noCoverImage")}
            </div>
          )}

          <div className="p-8 sm:p-10">
            <div className="mb-4 h-1.5 w-16 rounded-full bg-primary" />

            {article.category && (
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                {article.category}
              </span>
            )}

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              {article.title}
            </h1>

            {(article.author_name || publishedDate) && (
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500">
                {article.author_name && (
                  <span>
                    {t("article.by", {
                      author: article.author_name,
                    })}
                  </span>
                )}

                {article.author_name && publishedDate && (
                  <span aria-hidden="true">•</span>
                )}

                {publishedDate && (
                  <time dateTime={article.published_at ?? undefined}>
                    {publishedDate}
                  </time>
                )}
              </div>
            )}

            {article.excerpt && (
              <p className="mt-6 text-lg leading-8 text-zinc-600">
                {article.excerpt}
              </p>
            )}

            <div className="mt-8 border-t border-zinc-200 pt-8">
              <div
                className="
                  prose prose-zinc max-w-none
                  prose-headings:font-bold
                  prose-headings:text-zinc-900
                  prose-p:leading-8
                  prose-p:text-zinc-700
                  prose-a:text-primary
                  prose-a:no-underline
                  hover:prose-a:underline
                  prose-img:rounded-2xl
                  prose-blockquote:border-primary
                  prose-blockquote:text-zinc-600
                  prose-li:text-zinc-700
                  prose-strong:text-zinc-900
                "
                dangerouslySetInnerHTML={{
                  __html: article.content,
                }}
              />
            </div>
          </div>
        </article>

        <section className="mt-10 rounded-3xl border border-zinc-200 bg-primary px-8 py-10 text-center text-white shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight">
            {t("cta.title")}
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
            {t("cta.description")}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/coaches"
              className="inline-flex justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-zinc-100"
            >
              {t("cta.exploreCoaches")}
            </Link>

            <Link
              href="/gyms"
              className="inline-flex justify-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("cta.discoverGyms")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}