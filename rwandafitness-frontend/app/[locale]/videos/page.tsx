"use client";

import {useEffect, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {ArrowUpRight, Play, Video as VideoIcon} from "lucide-react";
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

type VideoResponse = Video[] | {results: Video[]};

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === "youtu.be" || host === "www.youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] || null;
    }
    if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      const segments = parsed.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(segments[0])) return segments[1] || null;
    }
    return null;
  } catch {
    return null;
  }
}

function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : null;
}

function extractVideos(data: unknown): Video[] {
  if (Array.isArray(data)) return data as Video[];
  if (data && typeof data === "object" && "results" in data) {
    const results = (data as VideoResponse & {results?: unknown}).results;
    if (Array.isArray(results)) return results as Video[];
  }
  throw new Error("Unexpected video response format");
}

export default function VideosPage() {
  const locale = useLocale();
  const t = useTranslations("Videos");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadVideos() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await fetch(
          `${API_URL}/api/videos/?lang=${encodeURIComponent(locale)}`,
          {signal: controller.signal, cache: "no-store"},
        );
        if (!response.ok) throw new Error("Unable to load videos");
        const data: unknown = await response.json();
        if (!controller.signal.aborted) setVideos(extractVideos(data));
      } catch {
        if (controller.signal.aborted) return;
        setVideos([]);
        setErrorMessage(t("messages.loadFailed"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadVideos();
    return () => controller.abort();
  }, [locale, t]);

  return (
    <div className="min-h-screen bg-[#F3FAF6] text-[#17251E]">
      <header className="relative isolate overflow-hidden bg-[#003D24] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border-[65px] border-[#00CFFF]/10" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-[#007D36]/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#00CFFF]/40 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#00CFFF]">
            <span className="h-2 w-2 rounded-full bg-[#FFD21A]" />
            RwandaFitness
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">{t("title")}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">{t("description")}</p>
          <div className="mt-8 h-1.5 w-20 rounded-full bg-[#FFD21A]" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
        {errorMessage && (
          <div role="alert" className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">{errorMessage}</div>
        )}

        {loading ? (
          <div role="status" aria-live="polite">
            <p className="mb-6 text-sm font-medium text-[#52675B]">{t("loading")}</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="overflow-hidden rounded-[24px] border border-[#1A6549] bg-[#003D24] shadow-sm">
                  <div className="h-[260px] animate-pulse bg-[#15553D] sm:h-[290px] lg:h-[320px]" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-20 animate-pulse rounded bg-[#24694F]" />
                    <div className="h-6 w-4/5 animate-pulse rounded bg-[#24694F]" />
                    <div className="h-4 w-full animate-pulse rounded bg-[#24694F]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !errorMessage && videos.length === 0 ? (
          <div className="rounded-[28px] border border-[#DCEDE2] bg-white px-8 py-16 text-center shadow-sm">
            <VideoIcon aria-hidden="true" className="mx-auto h-12 w-12 text-[#007D36]" />
            <p className="mt-5 text-base font-medium text-[#52675B]">{t("empty")}</p>
          </div>
        ) : !errorMessage ? (
          <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => {
              const thumbnail = video.thumbnail || getYouTubeThumbnail(video.video_url);
              return (
                <Link
                  key={video.id}
                  href={`/videos/${video.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-[#276A50] bg-[#003D24] text-white shadow-[0_14px_38px_rgba(0,42,25,0.16)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00CFFF]/60 hover:shadow-[0_26px_55px_rgba(0,42,25,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00CFFF]"
                >
                  <div className="relative h-[260px] overflow-hidden bg-[#0D3527] sm:h-[290px] lg:h-[320px]">
                    {thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnail}
                        alt={video.title}
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.08]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
                        {t("noThumbnail")}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#001B10]/80 via-[#001B10]/10 to-[#001B10]/40 transition-all group-hover:from-[#001B10]/90" />
                    <span className="absolute left-4 top-4 rounded-full border border-[#FFD21A]/40 bg-[#003D24]/85 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#FFD21A] backdrop-blur-md">
                      {t(`languages.${video.language}`)}
                    </span>
                    <span aria-hidden="true" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-black/30 text-white backdrop-blur-md">
                      <VideoIcon className="h-4 w-4" />
                    </span>
                    <span aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white/85 bg-[#FFD21A] text-[#003D24] shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_35px_rgba(255,210,26,0.65)]">
                      <Play className="ml-0.5 h-6 w-6 fill-current" />
                    </span>
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#00CFFF] transition-all duration-500 group-hover:w-full" />
                  </div>

                  <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00CFFF]" aria-hidden="true" />
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#00CFFF]">RwandaFitness</span>
                    </div>
                    <h2 className="line-clamp-2 text-xl font-extrabold leading-snug tracking-tight text-white transition-colors group-hover:text-[#FFD21A]">
                      {video.title}
                    </h2>
                    {video.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#C9E2D5]">
                        {video.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between border-t border-white/15 pt-4 text-sm font-extrabold text-[#FFD21A]" style={{marginTop: "1.25rem"}}>
                      <span>{t("watchVideo")}</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FFD21A]/35 bg-[#FFD21A]/10 transition-all group-hover:bg-[#FFD21A] group-hover:text-[#003D24]">
                        <ArrowUpRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
      </main>
    </div>
  );
}
