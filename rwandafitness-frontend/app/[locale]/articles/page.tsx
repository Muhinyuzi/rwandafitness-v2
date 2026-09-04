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
  published_at: string | null;
};

type ArticlesResponse =
  | Article[]
  | {
      results?: Article[];
    };

export default function ArticlesPage() {
  const t =
    useTranslations(
      "ArticlesPage",
    );

  const locale =
    useLocale();

  const [
    articles,
    setArticles,
  ] = useState<Article[]>([]);

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  // =========================================================
  // LOAD ARTICLES
  // =========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadArticles() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/api/articles/?lang=${locale}`,
            {
              signal:
                controller.signal,
              cache:
                "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to load articles",
          );
        }

        const data:
          ArticlesResponse =
          await response.json();

        setArticles(
          Array.isArray(data)
            ? data
            : Array.isArray(
                  data.results,
                )
              ? data.results
              : [],
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        setArticles([]);

        setError(
          t("states.error"),
        );
      } finally {
        if (
          !controller
            .signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    void loadArticles();

    return () => {
      controller.abort();
    };
  }, [locale, t]);

  // =========================================================
  // DATE FORMAT
  // =========================================================

  function formatPublishedDate(
    date: string | null,
  ) {
    if (!date) {
      return t(
        "article.unknownDate",
      );
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return t(
        "article.unknownDate",
      );
    }

    return new Intl.DateTimeFormat(
      locale,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    ).format(parsedDate);
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
            <div className="max-w-3xl">
              <div className="h-7 w-32 animate-pulse rounded-full bg-zinc-200" />

              <div className="mt-5 h-11 w-72 animate-pulse rounded-xl bg-zinc-200" />

              <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded bg-zinc-100" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: 6,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm"
                >
                  <div className="aspect-[16/10] animate-pulse bg-zinc-200" />

                  <div className="space-y-4 p-5 sm:p-6">
                    <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />

                    <div className="h-7 w-full animate-pulse rounded bg-zinc-200" />

                    <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />

                    <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-100" />
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-zinc-200 bg-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
              {t(
                "header.badge",
              )}
            </span>

            <h1 className="mt-5 text-3xl font-black tracking-[-0.035em] text-zinc-950 sm:text-4xl lg:text-5xl">
              {t(
                "header.title",
              )}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base sm:leading-8">
              {t(
                "header.description",
              )}
            </p>

            {articles.length >
              0 && (
              <div className="mt-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-primary" />

                  <span>
                    {
                      articles.length
                    }
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!error &&
          articles.length ===
            0 && (
            <div className="rounded-[28px] border border-zinc-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                ✦
              </div>

              <p className="mt-5 text-sm text-zinc-600">
                {t(
                  "states.empty",
                )}
              </p>
            </div>
          )}

        {/* =====================================================
            ARTICLE GRID
        ====================================================== */}

        {!error &&
          articles.length >
            0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map(
                (
                  article,
                  index,
                ) => {
                  const isFeatured =
                    index === 0 &&
                    articles.length >
                      2;

                  return (
                    <Link
                      key={
                        article.id
                      }
                      href={`/articles/${article.slug}`}
                      className={`group overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)] ${
                        isFeatured
                          ? "md:col-span-2 lg:col-span-2"
                          : ""
                      }`}
                    >
                      {/* ===========================
                          IMAGE
                      ============================ */}

                      <div
                        className={`relative overflow-hidden bg-zinc-100 ${
                          isFeatured
                            ? "aspect-[16/8]"
                            : "aspect-[16/10]"
                        }`}
                      >
                        {article.cover_image_url ? (
                          <img
                            src={
                              article.cover_image_url
                            }
                            alt={
                              article.title
                            }
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                              ✦
                            </div>

                            <p className="mt-4 text-sm font-medium text-zinc-500">
                              {t(
                                "article.noImage",
                              )}
                            </p>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80" />

                        {/* CATEGORY */}

                        <div className="absolute left-4 top-4">
                          <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary shadow-md backdrop-blur">
                            {
                              article.category
                            }
                          </span>
                        </div>

                        {/* ARROW */}

                        <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-primary shadow-lg transition duration-300 group-hover:translate-x-1">
                          →
                        </div>
                      </div>

                      {/* ===========================
                          ARTICLE BODY
                      ============================ */}

                      <article
                        className={
                          isFeatured
                            ? "p-5 sm:p-7"
                            : "p-5 sm:p-6"
                        }
                      >
                        <time
                          dateTime={
                            article.published_at ??
                            undefined
                          }
                          className="text-xs font-medium text-zinc-400"
                        >
                          {formatPublishedDate(
                            article.published_at,
                          )}
                        </time>

                        <h2
                          className={`mt-3 font-black tracking-tight text-zinc-950 transition group-hover:text-primary ${
                            isFeatured
                              ? "text-2xl sm:text-3xl"
                              : "text-xl"
                          }`}
                        >
                          {
                            article.title
                          }
                        </h2>

                        <p
                          className={`mt-3 text-sm leading-7 text-zinc-600 ${
                            isFeatured
                              ? "line-clamp-4 max-w-3xl sm:text-base"
                              : "line-clamp-3"
                          }`}
                        >
                          {
                            article.excerpt
                          }
                        </p>

                        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                          <span className="text-sm font-bold text-primary">
                            {t(
                              "article.readMore",
                            )}
                          </span>

                          <span className="text-lg font-bold text-primary transition duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </article>
                    </Link>
                  );
                },
              )}
            </div>
          )}
      </section>
    </main>
  );
}