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

type ArticleVideo = {
  id: number;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  language: "en" | "rw" | "all";
  thumbnail: string | null;
};

type PaginatedVideos = {
  results: ArticleVideo[];
};

function isPaginatedVideos(
  data: unknown,
): data is PaginatedVideos {
  if (!data || typeof data !== "object") {
    return false;
  }

  const value = data as Record<string, unknown>;

  return Array.isArray(value.results);
}

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname === "youtu.be" ||
      parsed.hostname.endsWith(".youtu.be")
    ) {
      return (
        parsed.pathname
          .replace(/^\/+/, "")
          .split("/")[0] || null
      );
    }

    if (
      parsed.hostname === "youtube.com" ||
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "m.youtube.com"
    ) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] || null;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2] || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

function getYouTubeThumbnail(url: string) {
  const videoId = getYouTubeId(url);

  if (!videoId) {
    return null;
  }

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function ArticleDetailPage() {
  const params = useParams<{slug: string}>();
  const slug = params.slug;

  const t = useTranslations("ArticleDetailPage");
  const locale = useLocale();

  const [article, setArticle] =
    useState<Article | null>(null);

  const [videos, setVideos] =
    useState<ArticleVideo[]>([]);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    videosLoading,
    setVideosLoading,
  ] = useState(true);

  // =========================================================
  // LOAD ARTICLE
  // =========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadArticle() {
      try {
        setLoading(true);
        setError("");
        setArticle(null);

        const response = await fetch(
          `${API_URL}/api/articles/${encodeURIComponent(
            slug,
          )}/?lang=${locale}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              "ARTICLE_NOT_FOUND",
            );
          }

          throw new Error(
            "ARTICLE_LOAD_FAILED",
          );
        }

        const data: Article =
          await response.json();

        if (!controller.signal.aborted) {
          setArticle(data);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        if (
          error instanceof Error &&
          error.message ===
            "ARTICLE_NOT_FOUND"
        ) {
          setError(
            t("states.notFound"),
          );
        } else {
          setError(
            t("states.error"),
          );
        }
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    void loadArticle();

    return () => {
      controller.abort();
    };
  }, [slug, locale, t]);

  // =========================================================
  // LOAD ARTICLE VIDEOS
  // =========================================================

  useEffect(() => {
    const articleId = article?.id;

    if (!articleId) {
      setVideos([]);
      setVideosLoading(false);
      return;
    }

    const controller =
      new AbortController();

    async function loadVideos() {
      try {
        setVideosLoading(true);
        setVideos([]);

        const response = await fetch(
          `${API_URL}/api/videos/?lang=${locale}&article=${articleId}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load article videos.",
          );
        }

        const data: unknown =
          await response.json();

        if (Array.isArray(data)) {
          setVideos(
            data as ArticleVideo[],
          );
          return;
        }

        if (
          isPaginatedVideos(data)
        ) {
          setVideos(
            data.results,
          );
          return;
        }

        setVideos([]);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setVideos([]);
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setVideosLoading(false);
        }
      }
    }

    void loadVideos();

    return () => {
      controller.abort();
    };
  }, [
    article?.id,
    locale,
  ]);

  function formatPublishedDate(
    date: string | null,
  ) {
    if (!date) {
      return "";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      return "";
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
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-4xl px-6 py-10">
          <div
            role="status"
            className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm"
          >
            {t(
              "states.loading",
            )}
          </div>
        </main>
      </div>
    );
  }

  // =========================================================
  // ERROR / NOT FOUND
  // =========================================================

  if (error || !article) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-4xl px-6 py-10">
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error ||
              t(
                "states.notFound",
              )}
          </div>

          <Link
            href="/articles"
            className="mt-6 inline-flex text-sm font-semibold text-primary transition hover:underline"
          >
            {t(
              "navigation.back",
            )}
          </Link>
        </main>
      </div>
    );
  }

  const publishedDate =
    formatPublishedDate(
      article.published_at,
    );

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        <div className="mb-6">
          <Link
            href="/articles"
            className="text-sm font-medium text-primary transition hover:underline"
          >
            {t(
              "navigation.back",
            )}
          </Link>
        </div>

        <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          {article.cover_image_url ? (
            <div className="overflow-hidden bg-zinc-100">
              <img
                src={
                  article.cover_image_url
                }
                alt={
                  article.title
                }
                className="h-72 w-full object-cover sm:h-96"
              />
            </div>
          ) : (
            <div className="flex h-72 w-full items-center justify-center bg-zinc-100 px-4 text-center text-sm text-zinc-500 sm:h-96">
              {t(
                "article.noCoverImage",
              )}
            </div>
          )}

          <div className="p-8 sm:p-10">
            <div className="mb-4 h-1.5 w-16 rounded-full bg-primary" />

            {article.category && (
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                {
                  article.category
                }
              </span>
            )}

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              {
                article.title
              }
            </h1>

            {(article.author_name ||
              publishedDate) && (
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500">
                {article.author_name && (
                  <span>
                    {t(
                      "article.by",
                      {
                        author:
                          article.author_name,
                      },
                    )}
                  </span>
                )}

                {article.author_name &&
                  publishedDate && (
                    <span
                      aria-hidden="true"
                    >
                      •
                    </span>
                  )}

                {publishedDate && (
                  <time
                    dateTime={
                      article.published_at ??
                      undefined
                    }
                  >
                    {
                      publishedDate
                    }
                  </time>
                )}
              </div>
            )}

            {article.excerpt && (
              <div className="mx-auto max-w-3xl">
                <p className="mt-6 text-lg font-medium leading-8 text-zinc-600">
                  {
                    article.excerpt
                  }
                </p>
              </div>
            )}

            <div className="mt-8 border-t border-zinc-200 pt-8">
              <div className="mx-auto max-w-3xl">
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      article.content,
                  }}
                />
              </div>
            </div>
          </div>
        </article>

        {/* =====================================================
            ARTICLE VIDEOS
        ===================================================== */}

        {(videosLoading ||
          videos.length > 0) && (
          <section className="mt-10 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  {t(
                    "videos.title",
                  )}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {t(
                    "videos.description",
                  )}
                </p>
              </div>

              {videos.length >
                0 && (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {t(
                    "videos.count",
                    {
                      count:
                        videos.length,
                    },
                  )}
                </span>
              )}
            </div>

            {videosLoading ? (
              <div className="mt-6 rounded-2xl bg-zinc-50 p-5 text-sm text-zinc-500">
                {t(
                  "videos.loading",
                )}
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {videos.map(
                  (video) => {
                    const thumbnail =
                      video.thumbnail ||
                      getYouTubeThumbnail(
                        video.video_url,
                      );

                    return (
                      <Link
                        key={
                          video.id
                        }
                        href={`/videos/${video.slug}`}
                        className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="relative aspect-video overflow-hidden bg-zinc-100">
                          {thumbnail ? (
                            <img
                              src={
                                thumbnail
                              }
                              alt={
                                video.title
                              }
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-zinc-400">
                              {t(
                                "videos.noThumbnail",
                              )}
                            </div>
                          )}

                          <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/20">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-lg text-primary shadow-lg transition group-hover:scale-110">
                              ▶
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-zinc-900">
                            {
                              video.title
                            }
                          </h3>

                          {video.description && (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                              {
                                video.description
                              }
                            </p>
                          )}

                          <p className="mt-3 text-sm font-semibold text-primary">
                            {t(
                              "videos.watch",
                            )}{" "}
                            →
                          </p>
                        </div>
                      </Link>
                    );
                  },
                )}
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            CTA
        ===================================================== */}

        <section className="mt-10 rounded-3xl border border-zinc-200 bg-primary px-8 py-10 text-center text-white shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight">
            {t(
              "cta.title",
            )}
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
            {t(
              "cta.description",
            )}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/coaches"
              className="inline-flex justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-zinc-100"
            >
              {t(
                "cta.exploreCoaches",
              )}
            </Link>

            <Link
              href="/gyms"
              className="inline-flex justify-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t(
                "cta.discoverGyms",
              )}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}