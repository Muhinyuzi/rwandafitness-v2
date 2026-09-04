"use client";

import {useEffect, useState} from "react";
import {
  useLocale,
  useTranslations,
} from "next-intl";
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
  if (
    !data ||
    typeof data !== "object"
  ) {
    return false;
  }

  const value =
    data as Record<
      string,
      unknown
    >;

  return Array.isArray(
    value.results,
  );
}

function getYouTubeId(
  url: string,
) {
  try {
    const parsed =
      new URL(url);

    if (
      parsed.hostname ===
        "youtu.be" ||
      parsed.hostname.endsWith(
        ".youtu.be",
      )
    ) {
      return (
        parsed.pathname
          .replace(/^\/+/, "")
          .split("/")[0] ||
        null
      );
    }

    if (
      parsed.hostname ===
        "youtube.com" ||
      parsed.hostname ===
        "www.youtube.com" ||
      parsed.hostname ===
        "m.youtube.com"
    ) {
      if (
        parsed.pathname ===
        "/watch"
      ) {
        return parsed.searchParams.get(
          "v",
        );
      }

      if (
        parsed.pathname.startsWith(
          "/embed/",
        )
      ) {
        return (
          parsed.pathname.split(
            "/",
          )[2] || null
        );
      }

      if (
        parsed.pathname.startsWith(
          "/shorts/",
        )
      ) {
        return (
          parsed.pathname.split(
            "/",
          )[2] || null
        );
      }
    }

    return null;
  } catch {
    return null;
  }
}

function getYouTubeThumbnail(
  url: string,
) {
  const videoId =
    getYouTubeId(url);

  if (!videoId) {
    return null;
  }

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function normalizeArticleContent(
  html: string,
) {
  const backendUrl =
    API_URL.replace(
      /\/+$/,
      "",
    );

  return html
    .replace(
      /(<img\b[^>]*\bsrc=["'])\/media\//gi,
      `$1${backendUrl}/media/`,
    )
    .replace(
      /(<img\b[^>]*\bsrc=["'])(?!https?:\/\/|\/\/|\/|data:|blob:)/gi,
      `$1${backendUrl}/`,
    );
}

export default function ArticleDetailPage() {
  const params =
    useParams<{
      slug: string;
    }>();

  const slug =
    params.slug;

  const t =
    useTranslations(
      "ArticleDetailPage",
    );

  const locale =
    useLocale();

  const [
    article,
    setArticle,
  ] = useState<Article | null>(
    null,
  );

  const [
    videos,
    setVideos,
  ] = useState<ArticleVideo[]>(
    [],
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

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

        const response =
          await fetch(
            `${API_URL}/api/articles/${encodeURIComponent(
              slug,
            )}/?lang=${locale}`,
            {
              signal:
                controller.signal,
              cache:
                "no-store",
            },
          );

        if (!response.ok) {
          if (
            response.status ===
            404
          ) {
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

        if (
          !controller.signal
            .aborted
        ) {
          setArticle(data);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        if (
          error instanceof Error &&
          error.message ===
            "ARTICLE_NOT_FOUND"
        ) {
          setError(
            t(
              "states.notFound",
            ),
          );
        } else {
          setError(
            t(
              "states.error",
            ),
          );
        }
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(false);
        }
      }
    }

    void loadArticle();

    return () => {
      controller.abort();
    };
  }, [
    slug,
    locale,
    t,
  ]);

  // =========================================================
  // LOAD ARTICLE VIDEOS
  // =========================================================

  useEffect(() => {
    const articleId =
      article?.id;

    if (!articleId) {
      setVideos([]);
      setVideosLoading(
        false,
      );
      return;
    }

    const controller =
      new AbortController();

    async function loadVideos() {
      try {
        setVideosLoading(
          true,
        );

        setVideos([]);

        const response =
          await fetch(
            `${API_URL}/api/videos/?lang=${locale}&article=${articleId}`,
            {
              signal:
                controller.signal,
              cache:
                "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load article videos.",
          );
        }

        const data: unknown =
          await response.json();

        if (
          Array.isArray(
            data,
          )
        ) {
          setVideos(
            data as ArticleVideo[],
          );

          return;
        }

        if (
          isPaginatedVideos(
            data,
          )
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
          error.name ===
            "AbortError"
        ) {
          return;
        }

        setVideos([]);
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setVideosLoading(
            false,
          );
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

  // =========================================================
  // DATE
  // =========================================================

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
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-sm">
            <div className="h-[320px] animate-pulse bg-zinc-200 sm:h-[460px]" />

            <div className="mx-auto max-w-4xl p-6 sm:p-10">
              <div className="h-5 w-24 animate-pulse rounded bg-zinc-100" />

              <div className="mt-5 h-10 w-full animate-pulse rounded-lg bg-zinc-200" />

              <div className="mt-3 h-10 w-3/4 animate-pulse rounded-lg bg-zinc-200" />

              <div className="mt-6 h-5 w-52 animate-pulse rounded bg-zinc-100" />

              <div className="mt-8 space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />

                <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />

                <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (
    error ||
    !article
  ) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
          >
            {error ||
              t(
                "states.notFound",
              )}
          </div>

          <Link
            href="/articles"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:gap-3"
          >
            <span>
              ←
            </span>

            <span>
              {t(
                "navigation.back",
              )}
            </span>
          </Link>
        </div>
      </main>
    );
  }

  const publishedDate =
    formatPublishedDate(
      article.published_at,
    );

  const normalizedContent =
    normalizeArticleContent(
      article.content,
    );

  return (
    <main className="min-h-screen bg-zinc-50 pb-16">
      {/* =====================================================
          TOP NAVIGATION
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-8">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm ring-1 ring-zinc-200 transition hover:-translate-x-0.5 hover:shadow-md"
        >
          <span>
            ←
          </span>

          <span>
            {t(
              "navigation.back",
            )}
          </span>
        </Link>
      </div>

      {/* =====================================================
          ARTICLE
      ====================================================== */}

      <article>
        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[30px] bg-zinc-950 shadow-xl sm:rounded-[38px]">
            <div className="relative min-h-[430px] sm:min-h-[540px] lg:min-h-[620px]">
              {article.cover_image_url ? (
                <img
                  src={
                    article.cover_image_url
                  }
                  alt={
                    article.title
                  }
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black px-6 text-center text-sm text-white/50">
                  {t(
                    "article.noCoverImage",
                  )}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-12">
                <div className="max-w-5xl">
                  {article.category && (
                    <span className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-xs font-black uppercase tracking-[0.08em] text-primary shadow-lg backdrop-blur">
                      {
                        article.category
                      }
                    </span>
                  )}

                  <h1 className="mt-4 max-w-5xl text-3xl font-black leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                    {
                      article.title
                    }
                  </h1>

                  {(article.author_name ||
                    publishedDate) && (
                    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-white/75">
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
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            ARTICLE BODY
        ==================================================== */}

        <section className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative -mt-1 rounded-b-[30px] border-x border-b border-zinc-200 bg-white px-5 pb-8 pt-8 shadow-sm sm:px-10 sm:pb-12 sm:pt-10 lg:px-14">
            {article.excerpt && (
              <div className="mx-auto max-w-3xl">
                <p className="border-l-4 border-primary pl-5 text-lg font-semibold leading-8 text-zinc-700 sm:pl-6 sm:text-xl sm:leading-9">
                  {
                    article.excerpt
                  }
                </p>
              </div>
            )}

            <div
              className={`mx-auto max-w-3xl ${
                article.excerpt
                  ? "mt-9 border-t border-zinc-200 pt-9"
                  : ""
              }`}
            >
              <div
                className="article-content"
                dangerouslySetInnerHTML={{
                  __html:
                    normalizedContent,
                }}
              />
            </div>
          </div>
        </section>
      </article>

      {/* =====================================================
          VIDEOS
      ====================================================== */}

      {(videosLoading ||
        videos.length >
          0) && (
        <section className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">
          <div className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                  {t(
                    "videos.title",
                  )}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                  {t(
                    "videos.description",
                  )}
                </p>
              </div>

              {videos.length >
                0 && (
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
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
                        className="group overflow-hidden rounded-[24px] border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
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
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-zinc-400">
                              {t(
                                "videos.noThumbnail",
                              )}
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/10 transition group-hover:bg-black/25" />

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-xl text-primary shadow-xl transition duration-300 group-hover:scale-110">
                              ▶
                            </div>
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="font-black text-zinc-950">
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

                          <p className="mt-4 text-sm font-bold text-primary">
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
          </div>
        </section>
      )}

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[30px] bg-primary px-6 py-10 text-center text-white shadow-lg sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
              RwandaFitness
            </p>

            <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
              {t(
                "cta.title",
              )}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              {t(
                "cta.description",
              )}
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/coaches"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-black text-primary shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-50"
              >
                {t(
                  "cta.exploreCoaches",
                )}
              </Link>

              <Link
                href="/gyms"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                {t(
                  "cta.discoverGyms",
                )}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}