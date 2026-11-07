"use client";

import {useEffect, useMemo, useState} from "react";
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

type PaginatedVideos = {results: ArticleVideo[]};

function isPaginatedVideos(value: unknown): value is PaginatedVideos {
  return Boolean(value && typeof value === "object" &&
    Array.isArray((value as Record<string, unknown>).results));
}

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === "youtu.be" || host === "www.youtu.be") {
      return parsed.pathname.replace(/^\/+/, "").split("/")[0] || null;
    }
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2] || null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

// Keep Django's rich-text images working when the API returns relative paths.
// As with the original page, HTML must be sanitized on the backend before rendering.
function normalizeArticleContent(html: string): string {
  const backendUrl = API_URL.replace(/\/+$/, "");
  return html
    .replace(/(<img\b[^>]*\bsrc=["'])\/?media\//gi, `$1${backendUrl}/media/`)
    .replace(/(<img\b[^>]*\bsrc=["'])(?!https?:\/\/|\/\/|\/|data:|blob:|#)/gi, `$1${backendUrl}/`);
}

export default function ArticleDetailPage() {
  const params = useParams<{slug: string}>();
  const slug = params.slug;
  const t = useTranslations("ArticleDetailPage");
  const locale = useLocale();
  const [article, setArticle] = useState<Article | null>(null);
  const [videos, setVideos] = useState<ArticleVideo[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadArticle() {
      try {
        setLoading(true);
        setError("");
        setArticle(null);
        const response = await fetch(
          `${API_URL}/api/articles/${encodeURIComponent(slug)}/?lang=${locale}`,
          {signal: controller.signal, cache: "no-store"},
        );
        if (!response.ok) {
          throw new Error(response.status === 404 ? "ARTICLE_NOT_FOUND" : "ARTICLE_LOAD_FAILED");
        }
        const data: Article = await response.json();
        if (!controller.signal.aborted) setArticle(data);
      } catch (caught) {
        if (caught instanceof Error && caught.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setError(t(caught instanceof Error && caught.message === "ARTICLE_NOT_FOUND"
            ? "states.notFound" : "states.error"));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadArticle();
    return () => controller.abort();
  }, [slug, locale, t]);

  useEffect(() => {
    const articleId = article?.id;
    if (!articleId) {
      setVideos([]);
      setVideosLoading(false);
      return;
    }
    const controller = new AbortController();
    async function loadVideos() {
      try {
        setVideosLoading(true);
        setVideos([]);
        const response = await fetch(
          `${API_URL}/api/videos/?lang=${locale}&article=${articleId}`,
          {signal: controller.signal, cache: "no-store"},
        );
        if (!response.ok) throw new Error("Unable to load article videos");
        const data: unknown = await response.json();
        if (!controller.signal.aborted) {
          setVideos(Array.isArray(data) ? data as ArticleVideo[]
            : isPaginatedVideos(data) ? data.results : []);
        }
      } catch (caught) {
        if (caught instanceof Error && caught.name === "AbortError") return;
        if (!controller.signal.aborted) setVideos([]);
      } finally {
        if (!controller.signal.aborted) setVideosLoading(false);
      }
    }
    void loadVideos();
    return () => controller.abort();
  }, [article?.id, locale]);

  const publishedDate = useMemo(() => {
    if (!article?.published_at) return "";
    const date = new Date(article.published_at);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(locale, {
      year: "numeric", month: "long", day: "numeric",
    }).format(date);
  }, [article?.published_at, locale]);

  const normalizedContent = useMemo(() =>
    normalizeArticleContent(article?.content || ""), [article?.content]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3FAF6] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl animate-pulse overflow-hidden rounded-[32px] bg-white shadow-sm">
          <div className="h-[340px] bg-emerald-100 sm:h-[490px]" />
          <div className="mx-auto max-w-3xl space-y-5 px-6 py-12 sm:px-10">
            <div className="h-4 w-32 rounded bg-emerald-100" />
            <div className="h-12 w-full rounded bg-emerald-100" />
            <div className="h-7 w-3/4 rounded bg-emerald-50" />
            <div className="mt-10 h-40 rounded bg-emerald-50" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="min-h-screen bg-[#F3FAF6] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-[32px] border border-emerald-100 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl text-[#075C38]">✦</div>
          <p role="alert" className="mt-6 text-lg font-semibold text-[#17251E]">
            {error || t("states.notFound")}
          </p>
          <Link href="/articles" className="mt-7 inline-flex rounded-full bg-[#075C38] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#003D24]">
            ← {t("navigation.back")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F3FAF6] pb-20 text-[#17251E]">
      <div className="mx-auto max-w-6xl px-4 pb-5 pt-7 sm:px-6 sm:pt-10">
        <Link href="/articles" className="inline-flex items-center gap-2 text-sm font-bold text-[#075C38] transition hover:-translate-x-1">
          <span aria-hidden="true">←</span> {t("navigation.back")}
        </Link>
      </div>

      <article>
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative isolate overflow-hidden rounded-[30px] bg-[#003D24] shadow-[0_24px_65px_rgba(0,61,36,0.16)] sm:rounded-[42px]">
            <div className="relative flex min-h-[440px] items-end sm:min-h-[530px] lg:min-h-[610px]">
              {article.cover_image_url ? (
                <img src={article.cover_image_url} alt={article.title} className="absolute inset-0 -z-20 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 -z-20 flex items-center justify-center bg-gradient-to-br from-[#075C38] via-[#003D24] to-[#001F13] text-white/60">
                  <span className="font-serif text-8xl italic text-[#FFD21A]/60">RF.</span>
                </div>
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#001A10]/95 via-[#002F1C]/60 to-[#003D24]/10" />
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[45px] border-[#00CFFF]/15" />
              <div className="relative w-full p-6 sm:p-10 lg:p-14">
                {article.category && (
                  <span className="inline-flex rounded-full border border-white/25 bg-white/95 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#075C38]">
                    {article.category}
                  </span>
                )}
                <h1 className="mt-5 max-w-5xl font-serif text-4xl font-bold italic leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[68px]">
                  {article.title}
                </h1>
                {(article.author_name || publishedDate) && (
                  <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-white/20 pt-5 text-sm font-medium text-white/85">
                    {article.author_name && <span>{t("article.by", {author: article.author_name})}</span>}
                    {article.author_name && publishedDate && <span aria-hidden="true" className="text-[#FFD21A]">✦</span>}
                    {publishedDate && <time dateTime={article.published_at ?? undefined}>{publishedDate}</time>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-b-[34px] border-x border-b border-[#DDEBE1] bg-white px-6 pb-12 pt-10 shadow-[0_15px_45px_rgba(0,61,36,0.05)] sm:px-10 sm:pt-14 lg:px-16">
            {article.excerpt && (
              <p className="mx-auto max-w-3xl border-l-[5px] border-[#FFD21A] pl-5 font-serif text-xl font-semibold italic leading-relaxed text-[#075C38] sm:pl-7 sm:text-2xl">
                {article.excerpt}
              </p>
            )}
            <div className={`mx-auto max-w-3xl ${article.excerpt ? "mt-10 border-t border-emerald-100 pt-10" : ""}`}>
              <div className="article-content text-[#26382D]" dangerouslySetInnerHTML={{__html: normalizedContent}} />
            </div>
            <div className="mx-auto mt-12 max-w-3xl border-t border-emerald-100 pt-6">
              <Link href="/articles" className="inline-flex items-center gap-2 text-sm font-bold text-[#075C38] hover:underline">
                ← {t("navigation.back")}
              </Link>
            </div>
          </div>
        </section>
      </article>

      {(videosLoading || videos.length > 0) && (
        <section className="mx-auto mt-14 max-w-5xl px-4 sm:px-6">
          <div className="rounded-[32px] border border-emerald-100 bg-white p-6 shadow-sm sm:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.22em] text-[#007D36]">RwandaFitness / Video</span>
                <h2 className="mt-3 font-serif text-3xl font-bold italic text-[#003D24] sm:text-4xl">{t("videos.title")}</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#5C6E62]">{t("videos.description")}</p>
              </div>
              {videos.length > 0 && (
                <span className="rounded-full bg-[#F3FAF6] px-4 py-2 text-xs font-bold text-[#075C38]">
                  {t("videos.count", {count: videos.length})}
                </span>
              )}
            </div>
            {videosLoading ? (
              <div className="mt-8 animate-pulse rounded-2xl bg-[#F3FAF6] p-6 text-sm text-[#5C6E62]">{t("videos.loading")}</div>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {videos.map((video) => {
                  const thumbnail = video.thumbnail || getYouTubeThumbnail(video.video_url);
                  return (
                    <Link key={video.id} href={`/videos/${video.slug}`} className="group overflow-hidden rounded-[26px] border border-emerald-100 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative aspect-video overflow-hidden bg-[#E6F2EB]">
                        {thumbnail ? (
                          <img src={thumbnail} alt={video.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-5 text-center text-sm text-[#5C6E62]">{t("videos.noThumbnail")}</div>
                        )}
                        <div className="absolute inset-0 bg-[#003D24]/20 transition group-hover:bg-[#003D24]/35" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD21A] text-xl text-[#003D24] shadow-xl transition group-hover:scale-110" aria-hidden="true">▶</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-extrabold text-[#003D24]">{video.title}</h3>
                        {video.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5C6E62]">{video.description}</p>}
                        <p className="mt-5 text-sm font-bold text-[#007D36]">{t("videos.watch")} →</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto mt-14 max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#075C38] to-[#003D24] px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[35px] border-[#00CFFF]/15" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#00CFFF]/10 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FFD21A]">RwandaFitness</p>
            <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-bold italic leading-tight sm:text-4xl">{t("cta.title")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">{t("cta.description")}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/coaches" className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FFD21A] px-7 py-3 text-sm font-extrabold text-[#003D24] transition hover:-translate-y-0.5 hover:bg-[#FFE26A]">
                {t("cta.exploreCoaches")} →
              </Link>
              <Link href="/gyms" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 bg-white/10 px-7 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-white/20">
                {t("cta.discoverGyms")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
