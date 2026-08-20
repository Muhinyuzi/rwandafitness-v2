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

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname === "youtu.be" ||
      parsed.hostname.endsWith(".youtu.be")
    ) {
      return parsed.pathname
        .replace(/^\/+/, "")
        .split("/")[0];
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

function getYouTubeEmbedUrl(url: string) {
  const videoId = getYouTubeId(url);

  if (!videoId) {
    return null;
  }

  return `https://www.youtube.com/embed/${videoId}`;
}

export default function VideoDetailPage() {
  const locale = useLocale();
  const t = useTranslations("VideoDetail");
  const params = useParams();

  const slug =
    typeof params.slug === "string"
      ? params.slug
      : Array.isArray(params.slug)
        ? params.slug[0]
        : "";

  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadVideo = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setVideo(null);

        const response = await fetch(
          `${API_URL}/api/videos/${encodeURIComponent(
            slug,
          )}/?lang=${locale}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load video.",
          );
        }

        const data: Video = await response.json();

        if (!controller.signal.aborted) {
          setVideo(data);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setVideo(null);
        setErrorMessage(
          t("messages.loadFailed"),
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      void loadVideo();
    } else {
      setLoading(false);
      setVideo(null);
    }

    return () => {
      controller.abort();
    };
  }, [slug, locale, t]);

  const embedUrl = useMemo(() => {
    if (!video) {
      return null;
    }

    return getYouTubeEmbedUrl(
      video.video_url,
    );
  }, [video]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("loading")}
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">
            {errorMessage || t("notFound")}
          </p>

          <Link
            href="/videos"
            className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
          >
            ← {t("backToVideos")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/videos"
        className="inline-flex text-sm font-semibold text-primary hover:underline"
      >
        ← {t("backToVideos")}
      </Link>

      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="bg-black">
          {embedUrl ? (
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                title={video.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center bg-zinc-900 px-6 text-center text-sm text-white/70">
              {t("invalidVideo")}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
              {t(
                `languages.${video.language}`,
              )}
            </span>

            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {t("videoLabel")}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {video.title}
          </h1>

          {video.description && (
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-zinc-600">
              {video.description}
            </p>
          )}

          {(video.coach ||
            video.gym ||
            video.article) && (
            <div className="mt-8 border-t border-zinc-200 pt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {video.coach && (
                  <div className="rounded-2xl bg-zinc-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      {t("coach")}
                    </p>

                    <Link
                      href={`/coaches/${video.coach.id}`}
                      className="mt-2 inline-flex font-semibold text-primary transition hover:underline"
                    >
                      {video.coach.full_name}
                    </Link>
                  </div>
                )}

                {video.gym && (
                  <div className="rounded-2xl bg-zinc-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      {t("gym")}
                    </p>

                    <Link
                      href={`/gyms/${video.gym.slug}`}
                      className="mt-2 inline-flex font-semibold text-primary transition hover:underline"
                    >
                      {video.gym.name}
                    </Link>
                  </div>
                )}

                {video.article && (
                  <div className="rounded-2xl bg-zinc-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      {t("article")}
                    </p>

                    <Link
                      href={`/articles/${video.article.slug}`}
                      className="mt-2 inline-flex font-semibold text-primary transition hover:underline"
                    >
                      {video.article.title}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}