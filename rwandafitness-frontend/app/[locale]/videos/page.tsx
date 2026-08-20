"use client";

import {useEffect, useState} from "react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Video = {
  id: number;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  language: "en" | "rw" | "all";
  thumbnail: string | null;
  coach: number | null;
  gym: number | null;
  article: number | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }

    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
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

export default function VideosPage() {
  const locale = useLocale();
  const t = useTranslations("Videos");

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadVideos = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `${API_URL}/api/videos/?lang=${locale}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load videos.",
          );
        }

        const data: Video[] =
          await response.json();

        setVideos(data);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setVideos([]);
        setErrorMessage(
          t("messages.loadFailed"),
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadVideos();

    return () => {
      controller.abort();
    };
  }, [locale, t]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          RwandaFitness
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          {t("title")}
        </h1>

        <p className="mt-3 max-w-2xl text-zinc-600">
          {t("description")}
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!errorMessage && videos.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 shadow-sm">
          {t("empty")}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const thumbnail =
              video.thumbnail ||
              getYouTubeThumbnail(
                video.video_url,
              );

            return (
              <Link
                key={video.id}
                href={`/videos/${video.slug}`}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden bg-zinc-100">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                      {t("noThumbnail")}
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/20">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-xl text-primary shadow-lg transition group-hover:scale-110">
                      ▶
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                      {t(
                        `languages.${video.language}`,
                      )}
                    </span>

                    <span className="text-xs text-zinc-400">
                      Video
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold text-zinc-900">
                    {video.title}
                  </h2>

                  {video.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
                      {video.description}
                    </p>
                  )}

                  <div className="mt-4 text-sm font-semibold text-primary">
                    {t("watchVideo")} →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}