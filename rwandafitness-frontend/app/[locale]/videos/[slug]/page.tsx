"use client";

import {useEffect, useMemo, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useParams} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type VideoCoach = {
  id: number;
  full_name: string;
};

type VideoGym = {
  id: number;
  name: string;
  slug: string;
};

type VideoArticle = {
  id: number;
  title: string;
  slug: string;
};

type Video = {
  id: number;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  language: "en" | "rw" | "all";
  thumbnail: string | null;
  coach: VideoCoach | null;
  gym: VideoGym | null;
  article: VideoArticle | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    let candidate: string | null = null;

    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      candidate = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtube-nocookie.com" ||
      host.endsWith(".youtube-nocookie.com")
    ) {
      if (parsed.pathname === "/watch") {
        candidate = parsed.searchParams.get("v");
      } else if (
        parsed.pathname.startsWith("/embed/") ||
        parsed.pathname.startsWith("/shorts/") ||
        parsed.pathname.startsWith("/live/")
      ) {
        candidate = parsed.pathname.split("/")[2] ?? null;
      }
    }

    // Reject arbitrary paths/parameters before inserting the ID into an embed URL.
    return candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate)
      ? candidate
      : null;
  } catch {
    return null;
  }
}

function getYouTubeEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

export default function VideoDetailPage() {
  const locale = useLocale();
  const t = useTranslations("VideoDetail");
  const params = useParams<{slug: string | string[]}>();

  const slug =
    typeof params.slug === "string"
      ? params.slug
      : Array.isArray(params.slug)
        ? (params.slug[0] ?? "")
        : "";

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    if (!slug) {
      setVideo(null);
      setErrorMessage("");
      setLoading(false);
      return () => controller.abort();
    }

    const loadVideo = async () => {
      setLoading(true);
      setErrorMessage("");
      setVideo(null);

      try {
        const response = await fetch(
          `${API_URL}/api/videos/${encodeURIComponent(slug)}/?lang=${encodeURIComponent(locale)}`,
          {signal: controller.signal, cache: "no-store"},
        );

        if (!response.ok) {
          throw new Error("Unable to load video.");
        }

        const data: Video = await response.json();
        if (!controller.signal.aborted) {
          setVideo(data);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof Error && error.name === "AbortError") return;
        setVideo(null);
        setErrorMessage(t("messages.loadFailed"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadVideo();
    return () => controller.abort();
  }, [slug, locale, t]);

  const embedUrl = useMemo(
    () => (video ? getYouTubeEmbedUrl(video.video_url) : null),
    [video],
  );

  if (loading) {
    return (
      <main className="min-h-[75vh] bg-[#F3FAF6] px-4 py-10 sm:px-6" aria-busy="true">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-5 w-36 animate-pulse rounded-full bg-[#D8EADF]" />
          <div className="overflow-hidden rounded-[28px] border border-[#DDEBE2] bg-white shadow-sm">
            <div className="aspect-video animate-pulse bg-[#003D24]" />
            <div className="space-y-4 p-6 sm:p-9">
              <div className="h-5 w-24 animate-pulse rounded-full bg-[#E4F0E8]" />
              <div className="h-9 w-3/4 animate-pulse rounded-lg bg-[#E4F0E8]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#E4F0E8]" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-[#E4F0E8]" />
              <p className="sr-only" role="status">{t("loading")}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!video) {
    return (
      <main className="flex min-h-[65vh] items-center bg-[#F3FAF6] px-4 py-12 sm:px-6">
        <div className="mx-auto w-full max-w-xl rounded-[28px] border border-[#DDEBE2] bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F5EC] text-3xl text-[#007D36]" aria-hidden="true">▶</div>
          <p role={errorMessage ? "alert" : "status"} className="text-base leading-7 text-[#425B4A]">
            {errorMessage || t("notFound")}
          </p>
          <Link
            href="/videos"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#FFD21A] px-6 py-3 text-sm font-bold text-[#003D24] transition hover:bg-[#FFE36D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007D36]"
          >
            ← {t("backToVideos")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3FAF6] pb-16">
      <div className="bg-[#003D24] px-4 pb-24 pt-9 sm:px-6 sm:pb-32 sm:pt-12">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/videos"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#00CFFF] hover:text-[#00CFFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00CFFF]"
          >
            ← {t("backToVideos")}
          </Link>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#FFD21A] px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#003D24]">
              {t("videoLabel")}
            </span>
            <span className="rounded-full border border-[#00CFFF]/50 bg-[#00CFFF]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#82E8FF]">
              {t(`languages.${video.language}`)}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
            {video.title}
          </h1>
        </div>
      </div>

      <div className="relative mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20 sm:px-6">
        <article className="overflow-hidden rounded-[28px] border border-[#DDEBE2] bg-white shadow-[0_20px_70px_rgba(0,61,36,0.1)] sm:rounded-[36px]">
          <div className="aspect-video w-full bg-[#071D14]">
            {embedUrl ? (
              <iframe
                key={embedUrl}
                src={embedUrl}
                title={video.title}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/75">
                {t("invalidVideo")}
              </div>
            )}
          </div>

          <div className="p-6 sm:p-9 lg:p-11">
            {video.description && (
              <section aria-label={video.title}>
                <p className="whitespace-pre-line text-base leading-8 text-[#425B4A]">
                  {video.description}
                </p>
              </section>
            )}

            {(video.coach || video.gym || video.article) && (
              <section className="mt-9 border-t border-[#E0EDE4] pt-8">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {video.coach && (
                    <div className="rounded-2xl border border-[#DDEBE2] bg-[#F3FAF6] p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#537361]">{t("coach")}</p>
                      <Link
                        href={`/coaches/${video.coach.id}`}
                        className="mt-3 inline-flex break-words text-base font-bold text-[#007D36] underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007D36]"
                      >
                        {video.coach.full_name} ↗
                      </Link>
                    </div>
                  )}

                  {video.gym && (
                    <div className="rounded-2xl border border-[#DDEBE2] bg-[#F3FAF6] p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#537361]">{t("gym")}</p>
                      <Link
                        href={`/gyms/${video.gym.slug}`}
                        className="mt-3 inline-flex break-words text-base font-bold text-[#007D36] underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007D36]"
                      >
                        {video.gym.name} ↗
                      </Link>
                    </div>
                  )}

                  {video.article && (
                    <div className="rounded-2xl border border-[#DDEBE2] bg-[#F3FAF6] p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#537361]">{t("article")}</p>
                      <Link
                        href={`/articles/${video.article.slug}`}
                        className="mt-3 inline-flex break-words text-base font-bold text-[#007D36] underline-offset-4 transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007D36]"
                      >
                        {video.article.title} ↗
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
