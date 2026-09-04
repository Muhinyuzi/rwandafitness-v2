"use client";

import {useEffect, useState} from "react";
import {
  useLocale,
  useTranslations,
} from "next-intl";
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

export default function GymDetailPage() {
  const locale =
    useLocale();

  const t =
    useTranslations(
      "GymDetail",
    );

  const params =
    useParams();

  const slug =
    typeof params.slug ===
    "string"
      ? params.slug
      : Array.isArray(
            params.slug,
          )
        ? params.slug[0]
        : "";

  const [gym, setGym] =
    useState<Gym | null>(
      null,
    );

  const [
    videos,
    setVideos,
  ] = useState<GymVideo[]>(
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

  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState<
    number | null
  >(null);

  // =========================================================
  // LOAD GYM
  // =========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    const loadGym =
      async () => {
        try {
          setLoading(true);
          setError("");
          setGym(null);

          const response =
            await fetch(
              `${API_URL}/api/gyms/${encodeURIComponent(
                slug,
              )}/?lang=${locale}`,
              {
                signal:
                  controller.signal,
                cache:
                  "no-store",
              },
            );

          if (
            response.status ===
            404
          ) {
            setError(
              t(
                "messages.notFound",
              ),
            );
            return;
          }

          if (
            !response.ok
          ) {
            throw new Error(
              "Failed to load gym",
            );
          }

          const data: Gym =
            await response.json();

          if (
            !controller
              .signal.aborted
          ) {
            setGym(data);
          }
        } catch (
          caughtError
        ) {
          if (
            caughtError instanceof
              Error &&
            caughtError.name ===
              "AbortError"
          ) {
            return;
          }

          setError(
            t(
              "messages.loadFailed",
            ),
          );
        } finally {
          if (
            !controller
              .signal.aborted
          ) {
            setLoading(
              false,
            );
          }
        }
      };

    if (slug) {
      void loadGym();
    } else {
      setLoading(false);

      setError(
        t(
          "messages.notFound",
        ),
      );
    }

    return () => {
      controller.abort();
    };
  }, [
    slug,
    locale,
    t,
  ]);

  // =========================================================
  // LOAD VIDEOS
  // =========================================================

  useEffect(() => {
    if (!gym?.id) {
      setVideos([]);
      setVideosLoading(
        false,
      );
      return;
    }

    const controller =
      new AbortController();

    const loadVideos =
      async () => {
        try {
          setVideosLoading(
            true,
          );

          setVideos([]);

          const response =
            await fetch(
              `${API_URL}/api/videos/?lang=${locale}&gym=${gym.id}`,
              {
                signal:
                  controller.signal,
                cache:
                  "no-store",
              },
            );

          if (
            !response.ok
          ) {
            throw new Error(
              "Unable to load gym videos",
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
              data as GymVideo[],
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
        } catch (
          caughtError
        ) {
          if (
            caughtError instanceof
              Error &&
            caughtError.name ===
              "AbortError"
          ) {
            return;
          }

          setVideos([]);
        } finally {
          if (
            !controller
              .signal.aborted
          ) {
            setVideosLoading(
              false,
            );
          }
        }
      };

    void loadVideos();

    return () => {
      controller.abort();
    };
  }, [
    gym?.id,
    locale,
  ]);

  // =========================================================
  // GALLERY
  // =========================================================

  const galleryImages =
    gym?.gallery_images?.filter(
      (item) =>
        Boolean(
          item.image_url,
        ),
    ) ?? [];

  const closeLightbox =
    () => {
      setSelectedImageIndex(
        null,
      );
    };

  const showPreviousImage =
    () => {
      setSelectedImageIndex(
        (current) => {
          if (
            current ===
              null ||
            galleryImages.length ===
              0
          ) {
            return null;
          }

          return (
            (current -
              1 +
              galleryImages.length) %
            galleryImages.length
          );
        },
      );
    };

  const showNextImage =
    () => {
      setSelectedImageIndex(
        (current) => {
          if (
            current ===
              null ||
            galleryImages.length ===
              0
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
      selectedImageIndex ===
      null
    ) {
      return;
    }

    const handleKeyDown =
      (
        event: KeyboardEvent,
      ) => {
        if (
          event.key ===
          "Escape"
        ) {
          closeLightbox();
        }

        if (
          event.key ===
          "ArrowLeft"
        ) {
          showPreviousImage();
        }

        if (
          event.key ===
          "ArrowRight"
        ) {
          showNextImage();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    const previousOverflow =
      document.body.style
        .overflow;

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
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-sm">
            <div className="h-[340px] animate-pulse bg-zinc-200 sm:h-[440px]" />

            <div className="p-6 sm:p-8">
              <div className="h-8 w-60 animate-pulse rounded-lg bg-zinc-200" />

              <div className="mt-4 h-4 w-32 animate-pulse rounded bg-zinc-100" />
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
    !gym
  ) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
          >
            {error ||
              t(
                "messages.notFound",
              )}
          </div>
        </div>
      </main>
    );
  }

  const selectedImage =
    selectedImageIndex !==
    null
      ? galleryImages[
          selectedImageIndex
        ]
      : null;

  return (
    <>
      <main className="min-h-screen bg-zinc-50 pb-16">
        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-8">
          <div className="relative overflow-hidden rounded-[30px] bg-zinc-950 shadow-xl sm:rounded-[38px]">
            <div className="relative h-[380px] sm:h-[500px] lg:h-[580px]">
              {gym.cover_image_url ? (
                <img
                  src={
                    gym.cover_image_url
                  }
                  alt={gym.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 px-6 text-center text-sm text-white/60">
                  {t(
                    "coverUnavailable",
                  )}
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
                <div className="max-w-4xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {gym.is_verified && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/95 px-3 py-2 text-xs font-bold text-emerald-700 shadow-lg backdrop-blur">
                        ✓{" "}
                        {t(
                          "verified",
                        )}
                      </span>
                    )}

                    <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
                      📍{" "}
                      {
                        gym.city
                      }
                    </span>
                  </div>

                  <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                    {gym.name}
                  </h1>

                  {gym.address && (
                    <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
                      {
                        gym.address
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            MAIN LAYOUT
        ====================================================== */}

        <section className="mx-auto mt-8 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          {/* ===================================================
              LEFT CONTENT
          ==================================================== */}

          <div className="min-w-0 space-y-8">
            {/* ABOUT */}

            <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-5 h-1.5 w-14 rounded-full bg-primary" />

              <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                {t(
                  "about.title",
                )}
              </h2>

              <p className="mt-5 whitespace-pre-line text-[15px] leading-8 text-zinc-600 sm:text-base">
                {gym.description ||
                  t(
                    "about.empty",
                  )}
              </p>
            </section>

            {/* =================================================
                GALLERY
            ================================================== */}

            {galleryImages.length >
              0 && (
              <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                      {t(
                        "gallery.title",
                      )}
                    </h2>
                  </div>

                  <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-500">
                    {
                      galleryImages.length
                    }{" "}
                    photos
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                  {galleryImages.map(
                    (
                      item,
                      index,
                    ) => {
                      const isFeatured =
                        index ===
                          0 &&
                        galleryImages.length >
                          2;

                      return (
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
                          className={`group relative overflow-hidden rounded-[20px] bg-zinc-100 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            isFeatured
                              ? "col-span-2 aspect-[16/9]"
                              : "aspect-square sm:aspect-[4/3]"
                          }`}
                        >
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
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />

                          {item.caption && (
                            <p className="absolute bottom-4 left-4 right-4 line-clamp-2 text-sm font-semibold text-white">
                              {
                                item.caption
                              }
                            </p>
                          )}

                          <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm text-zinc-900 opacity-0 shadow-md backdrop-blur transition group-hover:opacity-100">
                            ↗
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                COACHES
            ================================================== */}

            {gym.coaches?.length >
              0 && (
              <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                    {t(
                      "coaches.title",
                    )}
                  </h2>

                  <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                    {
                      gym.coaches
                        .length
                    }
                  </span>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {gym.coaches.map(
                    (coach) => (
                      <Link
                        key={
                          coach.id
                        }
                        href={`/coaches/${coach.id}`}
                        className="group overflow-hidden rounded-[24px] border border-zinc-200 bg-zinc-50 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                      >
                        <div className="flex gap-4 p-4">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[20px] bg-primary">
                            {coach.photo_url ? (
                              <img
                                src={
                                  coach.photo_url
                                }
                                alt={
                                  coach.full_name
                                }
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white">
                                {coach.full_name
                                  .charAt(
                                    0,
                                  )
                                  .toUpperCase()}
                              </div>
                            )}

                            {coach.is_verified && (
                              <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-black text-emerald-700 shadow">
                                ✓
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 py-1">
                            <h3 className="truncate text-base font-black text-zinc-950 transition group-hover:text-primary">
                              {
                                coach.full_name
                              }
                            </h3>

                            <p className="mt-1 line-clamp-1 text-sm font-semibold text-primary">
                              {
                                coach.specialty
                              }
                            </p>

                            <p className="mt-2 text-xs text-zinc-500">
                              📍{" "}
                              {
                                coach.city
                              }
                            </p>

                            <p className="mt-2 text-xs font-semibold text-zinc-700">
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

                          <span className="self-center text-lg font-bold text-primary transition group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              </section>
            )}

            {/* =================================================
                VIDEOS
            ================================================== */}

            {(videosLoading ||
              videos.length >
                0) && (
              <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
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
                              <h3 className="text-base font-black text-zinc-950">
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
              </section>
            )}
          </div>

          {/* ===================================================
              SIDEBAR
          ==================================================== */}

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-100 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                  RwandaFitness
                </p>

                <h2 className="mt-2 text-xl font-black tracking-tight text-zinc-950">
                  {t(
                    "information.title",
                  )}
                </h2>
              </div>

              <div className="space-y-5 p-6">
                {gym.address && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                      📍
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                        {t(
                          "information.address",
                        )}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-zinc-700">
                        {
                          gym.address
                        }
                      </p>
                    </div>
                  </div>
                )}

                {gym.phone && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                      ☎
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                        {t(
                          "information.phone",
                        )}
                      </p>

                      <a
                        href={`tel:${gym.phone}`}
                        className="mt-1 block text-sm font-semibold text-primary hover:underline"
                      >
                        {
                          gym.phone
                        }
                      </a>
                    </div>
                  </div>
                )}

                {gym.email && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                      ✉
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                        {t(
                          "information.email",
                        )}
                      </p>

                      <a
                        href={`mailto:${gym.email}`}
                        className="mt-1 block break-all text-sm font-semibold text-primary hover:underline"
                      >
                        {
                          gym.email
                        }
                      </a>
                    </div>
                  </div>
                )}

                {gym.opening_hours && (
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                      ◷
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                        {t(
                          "information.openingHours",
                        )}
                      </p>

                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-zinc-700">
                        {
                          gym.opening_hours
                        }
                      </p>
                    </div>
                  </div>
                )}

                {(gym.website ||
                  gym.instagram ||
                  gym.facebook) && (
                  <div className="border-t border-zinc-100 pt-5">
                    <div className="grid gap-3">
                      {gym.website && (
                        <a
                          href={
                            gym.website
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100"
                        >
                          <span>
                            {t(
                              "information.visitWebsite",
                            )}
                          </span>

                          <span>
                            ↗
                          </span>
                        </a>
                      )}

                      {gym.instagram && (
                        <a
                          href={
                            gym.instagram
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100"
                        >
                          <span>
                            Instagram
                          </span>

                          <span>
                            ↗
                          </span>
                        </a>
                      )}

                      {gym.facebook && (
                        <a
                          href={
                            gym.facebook
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100"
                        >
                          <span>
                            Facebook
                          </span>

                          <span>
                            ↗
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {gym.latitude &&
                  gym.longitude && (
                    <div className="border-t border-zinc-100 pt-5">
                      <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                        {t(
                          "information.coordinates",
                        )}
                      </p>

                      <p className="mt-2 text-xs text-zinc-500">
                        {
                          gym.latitude
                        }
                        ,{" "}
                        {
                          gym.longitude
                        }
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </aside>
        </section>
      </main>

      {/* =====================================================
          LIGHTBOX
      ====================================================== */}

      {selectedImage &&
        selectedImageIndex !==
          null && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
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
              className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
            >
              ×
            </button>

            <div
              className="relative flex h-full w-full max-w-7xl items-center justify-center"
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
                  className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />

                <div className="mt-4 flex max-w-3xl flex-col items-center gap-1 text-center text-white">
                  {selectedImage.caption && (
                    <p className="text-sm">
                      {
                        selectedImage.caption
                      }
                    </p>
                  )}

                  <p className="text-xs text-white/60">
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