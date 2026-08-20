"use client";

import {useEffect, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useParams} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type GymGalleryImage = {
  id: number;
  image_url: string | null;
  caption: string;
  sort_order: number;
};

type GymCoach = {
  id: number;
  full_name: string;
  specialty: string;
  city: string;
  price_per_session: string | null;
  is_verified: boolean;
  photo_url: string | null;
};

type GymVideo = {
  id: number;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  language: "en" | "rw" | "all";
  thumbnail: string | null;
};

type PaginatedVideos = {
  results: GymVideo[];
};

type Gym = {
  id: number;
  name: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  opening_hours: string;
  cover_image_url: string | null;
  instagram: string;
  facebook: string;
  latitude: string | null;
  longitude: string | null;
  slug: string;
  is_verified: boolean;
  gallery_images: GymGalleryImage[];
  coaches: GymCoach[];
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

export default function GymDetailPage() {
  const locale = useLocale();
  const t = useTranslations("GymDetail");
  const params = useParams();

  const slug =
    typeof params.slug === "string"
      ? params.slug
      : Array.isArray(params.slug)
        ? params.slug[0]
        : "";

  const [gym, setGym] =
    useState<Gym | null>(null);

  const [videos, setVideos] =
    useState<GymVideo[]>([]);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    videosLoading,
    setVideosLoading,
  ] = useState(true);

  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState<number | null>(null);

  // =========================================================
  // LOAD GYM
  // =========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    const loadGym = async () => {
      try {
        setLoading(true);
        setError("");
        setGym(null);

        const response = await fetch(
          `${API_URL}/api/gyms/${encodeURIComponent(
            slug,
          )}/?lang=${locale}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (response.status === 404) {
          setError(
            t("messages.notFound"),
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to load gym",
          );
        }

        const data: Gym =
          await response.json();

        if (!controller.signal.aborted) {
          setGym(data);
        }
      } catch (caughtError) {
        if (
          caughtError instanceof Error &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError(
          t("messages.loadFailed"),
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      void loadGym();
    } else {
      setLoading(false);
      setError(
        t("messages.notFound"),
      );
    }

    return () => {
      controller.abort();
    };
  }, [slug, locale, t]);

  // =========================================================
  // LOAD GYM VIDEOS
  // =========================================================

  useEffect(() => {
    if (!gym?.id) {
      setVideos([]);
      setVideosLoading(false);
      return;
    }

    const controller =
      new AbortController();

    const loadVideos = async () => {
      try {
        setVideosLoading(true);
        setVideos([]);

        const response = await fetch(
          `${API_URL}/api/videos/?lang=${locale}&gym=${gym.id}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load gym videos",
          );
        }

        const data: unknown =
          await response.json();

        if (Array.isArray(data)) {
          setVideos(
            data as GymVideo[],
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
      } catch (caughtError) {
        if (
          caughtError instanceof Error &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setVideos([]);
      } finally {
        if (!controller.signal.aborted) {
          setVideosLoading(false);
        }
      }
    };

    void loadVideos();

    return () => {
      controller.abort();
    };
  }, [gym?.id, locale]);

  // =========================================================
  // GALLERY
  // =========================================================

  const galleryImages =
    gym?.gallery_images?.filter(
      (item) => Boolean(item.image_url),
    ) ?? [];

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const showPreviousImage = () => {
    setSelectedImageIndex(
      (current) => {
        if (
          current === null ||
          galleryImages.length === 0
        ) {
          return null;
        }

        return (
          (
            current -
            1 +
            galleryImages.length
          ) %
          galleryImages.length
        );
      },
    );
  };

  const showNextImage = () => {
    setSelectedImageIndex(
      (current) => {
        if (
          current === null ||
          galleryImages.length === 0
        ) {
          return null;
        }

        return (
          (current + 1) %
          galleryImages.length
        );
      },
    );
  };

  // =========================================================
  // LIGHTBOX KEYBOARD
  // =========================================================

  useEffect(() => {
    if (
      selectedImageIndex === null
    ) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (
        event.key === "ArrowLeft"
      ) {
        showPreviousImage();
      }

      if (
        event.key === "ArrowRight"
      ) {
        showNextImage();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [
    selectedImageIndex,
    galleryImages.length,
  ]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("loading")}
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !gym) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error ||
            t(
              "messages.notFound",
            )}
        </div>
      </div>
    );
  }

  const selectedImage =
    selectedImageIndex !== null
      ? galleryImages[
          selectedImageIndex
        ]
      : null;

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          {gym.cover_image_url ? (
            <img
              src={
                gym.cover_image_url
              }
              alt={gym.name}
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="flex h-72 w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
              {t(
                "coverUnavailable",
              )}
            </div>
          )}

          <div className="p-8">
            <div className="mb-4 h-1.5 w-16 rounded-full bg-primary" />

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
                {gym.name}
              </h1>

              {gym.is_verified && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  ✔ {t("verified")}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              📍 {gym.city}
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
              <div>
                {/* ABOUT */}

                <h2 className="text-lg font-semibold text-zinc-900">
                  {t("about.title")}
                </h2>

                <p className="mt-3 whitespace-pre-line leading-8 text-zinc-600">
                  {gym.description ||
                    t(
                      "about.empty",
                    )}
                </p>

                {/* GALLERY */}

                {galleryImages.length >
                  0 && (
                  <div className="mt-10">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-lg font-semibold text-zinc-900">
                        {t(
                          "gallery.title",
                        )}
                      </h2>

                      <span className="text-xs text-zinc-500">
                        {
                          galleryImages.length
                        }{" "}
                        photos
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {galleryImages.map(
                        (
                          item,
                          index,
                        ) => (
                          <button
                            key={
                              item.id
                            }
                            type="button"
                            onClick={() =>
                              setSelectedImageIndex(
                                index,
                              )
                            }
                            className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          >
                            <div className="relative overflow-hidden">
                              <img
                                src={
                                  item.image_url as string
                                }
                                alt={
                                  item.caption ||
                                  t(
                                    "gallery.imageAlt",
                                    {
                                      number:
                                        index +
                                        1,
                                    },
                                  )
                                }
                                className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                              />

                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                                <span className="scale-90 rounded-full bg-black/70 px-3 py-2 text-xs font-medium text-white opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
                                  🔍
                                </span>
                              </div>
                            </div>

                            {item.caption && (
                              <div className="p-3 text-sm text-zinc-600">
                                {
                                  item.caption
                                }
                              </div>
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* COACHES */}

                {gym.coaches?.length >
                  0 && (
                  <div className="mt-10">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {t(
                        "coaches.title",
                      )}
                    </h2>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {gym.coaches.map(
                        (coach) => (
                          <Link
                            key={
                              coach.id
                            }
                            href={`/coaches/${coach.id}`}
                            className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              {coach.photo_url ? (
                                <img
                                  src={
                                    coach.photo_url
                                  }
                                  alt={
                                    coach.full_name
                                  }
                                  className="h-14 w-14 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                                  {coach.full_name
                                    .charAt(
                                      0,
                                    )
                                    .toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="truncate text-sm font-semibold text-zinc-900">
                                    {
                                      coach.full_name
                                    }
                                  </h3>

                                  {coach.is_verified && (
                                    <span
                                      title={t(
                                        "verified",
                                      )}
                                      className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700"
                                    >
                                      ✔
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-zinc-500">
                                  {
                                    coach.specialty
                                  }
                                </p>

                                <p className="mt-1 text-xs text-zinc-600">
                                  {coach.price_per_session
                                    ? t(
                                        "coaches.pricePerSession",
                                        {
                                          price:
                                            coach.price_per_session,
                                        },
                                      )
                                    : t(
                                        "coaches.contactForPrice",
                                      )}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* =========================================
                    GYM VIDEOS
                ========================================= */}

                {(videosLoading ||
                  videos.length >
                    0) && (
                  <section className="mt-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-zinc-900">
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
                      <div className="mt-4 rounded-2xl bg-zinc-50 p-5 text-sm text-zinc-500">
                        {t(
                          "videos.loading",
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-5 sm:grid-cols-2">
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
              </div>

              {/* =========================================
                  INFORMATION SIDEBAR
              ========================================= */}

              <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-zinc-900">
                  {t(
                    "information.title",
                  )}
                </h2>

                <div className="mt-4 space-y-3 text-sm text-zinc-600">
                  {gym.address && (
                    <p>
                      <span className="font-medium text-zinc-900">
                        {t(
                          "information.address",
                        )}
                        :
                      </span>{" "}
                      {gym.address}
                    </p>
                  )}

                  {gym.phone && (
                    <p>
                      <span className="font-medium text-zinc-900">
                        {t(
                          "information.phone",
                        )}
                        :
                      </span>{" "}
                      <a
                        href={`tel:${gym.phone}`}
                        className="text-primary underline"
                      >
                        {gym.phone}
                      </a>
                    </p>
                  )}

                  {gym.email && (
                    <p>
                      <span className="font-medium text-zinc-900">
                        {t(
                          "information.email",
                        )}
                        :
                      </span>{" "}
                      <a
                        href={`mailto:${gym.email}`}
                        className="break-all text-primary underline"
                      >
                        {gym.email}
                      </a>
                    </p>
                  )}

                  {gym.website && (
                    <p>
                      <span className="font-medium text-zinc-900">
                        {t(
                          "information.website",
                        )}
                        :
                      </span>{" "}
                      <a
                        href={
                          gym.website
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        {t(
                          "information.visitWebsite",
                        )}
                      </a>
                    </p>
                  )}

                  {gym.opening_hours && (
                    <div>
                      <span className="font-medium text-zinc-900">
                        {t(
                          "information.openingHours",
                        )}
                        :
                      </span>

                      <p className="mt-1 whitespace-pre-line leading-6">
                        {
                          gym.opening_hours
                        }
                      </p>
                    </div>
                  )}

                  {gym.instagram && (
                    <p>
                      <span className="font-medium text-zinc-900">
                        Instagram:
                      </span>{" "}
                      <a
                        href={
                          gym.instagram
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        {t(
                          "information.viewProfile",
                        )}
                      </a>
                    </p>
                  )}

                  {gym.facebook && (
                    <p>
                      <span className="font-medium text-zinc-900">
                        Facebook:
                      </span>{" "}
                      <a
                        href={
                          gym.facebook
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        {t(
                          "information.viewPage",
                        )}
                      </a>
                    </p>
                  )}

                  {gym.latitude &&
                    gym.longitude && (
                      <p>
                        <span className="font-medium text-zinc-900">
                          {t(
                            "information.coordinates",
                          )}
                          :
                        </span>{" "}
                        {gym.latitude},{" "}
                        {gym.longitude}
                      </p>
                    )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          LIGHTBOX
      ===================================================== */}

      {selectedImage &&
        selectedImageIndex !==
          null && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            role="dialog"
            aria-modal="true"
            onClick={
              closeLightbox
            }
          >
            <button
              type="button"
              onClick={
                closeLightbox
              }
              aria-label="Close"
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
            >
              ×
            </button>

            <div
              className="relative flex h-full w-full max-w-6xl items-center justify-center"
              onClick={(
                event,
              ) =>
                event.stopPropagation()
              }
            >
              {galleryImages.length >
                1 && (
                <button
                  type="button"
                  onClick={
                    showPreviousImage
                  }
                  aria-label="Previous image"
                  className="absolute left-0 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-3xl text-white transition hover:bg-black/80 sm:left-4"
                >
                  ‹
                </button>
              )}

              <div className="flex max-h-full max-w-full flex-col items-center">
                <img
                  src={
                    selectedImage.image_url as string
                  }
                  alt={
                    selectedImage.caption ||
                    t(
                      "gallery.imageAlt",
                      {
                        number:
                          selectedImageIndex +
                          1,
                      },
                    )
                  }
                  className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl"
                />

                <div className="mt-4 flex max-w-3xl flex-col items-center gap-1 text-center text-white">
                  {selectedImage.caption && (
                    <p className="text-sm">
                      {
                        selectedImage.caption
                      }
                    </p>
                  )}

                  <p className="text-xs text-white/70">
                    {selectedImageIndex +
                      1}{" "}
                    /{" "}
                    {
                      galleryImages.length
                    }
                  </p>
                </div>
              </div>

              {galleryImages.length >
                1 && (
                <button
                  type="button"
                  onClick={
                    showNextImage
                  }
                  aria-label="Next image"
                  className="absolute right-0 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-3xl text-white transition hover:bg-black/80 sm:right-4"
                >
                  ›
                </button>
              )}
            </div>
          </div>
        )}
    </>
  );
}