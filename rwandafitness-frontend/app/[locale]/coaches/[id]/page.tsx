"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";

import {
  Link,
  useRouter,
} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type CoachGalleryImage = {
  id: number;
  image_url: string | null;
  caption: string;
  sort_order: number;
};

type Coach = {
  id: number;
  full_name: string;
  bio: string;
  specialty: string;
  city: string;
  price_per_session: string | null;
  photo_url: string | null;
  is_verified: boolean;
  years_experience?: number;
  available_online?: boolean;
  available_in_person?: boolean;
  gym_name?: string | null;
  gym_slug?: string | null;
  average_rating: number | null;
  reviews_count: number;
  gallery_images?: CoachGalleryImage[];
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  client_name?: string;
  client_full_name?: string;
};

type PaginatedReviews = {
  results: Review[];
};

type CoachVideo = {
  id: number;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  language: "en" | "rw" | "all";
  thumbnail: string | null;
};

type PaginatedVideos = {
  results: CoachVideo[];
};

function isPaginatedReviews(
  data: unknown,
): data is PaginatedReviews {
  if (!data || typeof data !== "object") {
    return false;
  }

  const value = data as Record<string, unknown>;

  return Array.isArray(value.results);
}

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

function RatingStars({
  rating,
  size = "text-xl",
}: {
  rating: number;
  size?: string;
}) {
  const normalizedRating = Math.max(
    0,
    Math.min(5, rating),
  );

  const roundedRating = Math.round(
    normalizedRating,
  );

  return (
    <div
      className={`flex items-center gap-0.5 ${size}`}
      aria-label={`${normalizedRating.toFixed(1)} / 5`}
    >
      {Array.from(
        {length: 5},
        (_, index) => {
          const filled =
            index < roundedRating;

          return (
            <span
              key={index}
              className={
                filled
                  ? "text-amber-400"
                  : "text-zinc-300"
              }
              aria-hidden="true"
            >
              ★
            </span>
          );
        },
      )}
    </div>
  );
}

export default function CoachDetailPage() {
  const locale = useLocale();
  const t = useTranslations("CoachDetail");
  const params = useParams();
  const router = useRouter();

  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [coach, setCoach] =
    useState<Coach | null>(null);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [videos, setVideos] =
    useState<CoachVideo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    reviewsLoading,
    setReviewsLoading,
  ] = useState(true);

  const [
    videosLoading,
    setVideosLoading,
  ] = useState(true);

  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");

  const [
    statusMessage,
    setStatusMessage,
  ] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [
    showRequestBox,
    setShowRequestBox,
  ] = useState(false);

  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState<number | null>(null);

  // =========================================================
  // LOAD COACH
  // =========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    const loadCoach = async () => {
      try {
        setLoading(true);
        setCoach(null);

        const response = await fetch(
          `${API_URL}/api/coaches/${encodeURIComponent(
            id,
          )}/?lang=${locale}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Coach not found",
          );
        }

        const data: Coach =
          await response.json();

        setCoach(data);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setCoach(null);
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    };

    if (id) {
      void loadCoach();
    } else {
      setCoach(null);
      setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [id, locale]);

  // =========================================================
  // LOAD REVIEWS
  // =========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviews([]);

        const response = await fetch(
          `${API_URL}/api/reviews/?coach=${encodeURIComponent(
            id,
          )}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load reviews",
          );
        }

        const data: unknown =
          await response.json();

        if (Array.isArray(data)) {
          setReviews(
            data as Review[],
          );
          return;
        }

        if (
          isPaginatedReviews(data)
        ) {
          setReviews(
            data.results,
          );
          return;
        }

        setReviews([]);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setReviews([]);
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setReviewsLoading(false);
        }
      }
    };

    if (id) {
      void loadReviews();
    } else {
      setReviews([]);
      setReviewsLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [id]);

  // =========================================================
  // LOAD VIDEOS
  // =========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    const loadVideos = async () => {
      try {
        setVideosLoading(true);
        setVideos([]);

        const response = await fetch(
          `${API_URL}/api/videos/?lang=${locale}&coach=${encodeURIComponent(
            id,
          )}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load coach videos",
          );
        }

        const data: unknown =
          await response.json();

        if (Array.isArray(data)) {
          setVideos(
            data as CoachVideo[],
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
    };

    if (id) {
      void loadVideos();
    } else {
      setVideos([]);
      setVideosLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [id, locale]);

  // =========================================================
  // GALLERY
  // =========================================================

  const galleryImages =
    coach?.gallery_images?.filter(
      (
        item,
      ): item is CoachGalleryImage & {
        image_url: string;
      } => Boolean(item.image_url),
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
      if (
        event.key === "Escape"
      ) {
        setSelectedImageIndex(
          null,
        );
        return;
      }

      if (
        event.key === "ArrowLeft"
      ) {
        setSelectedImageIndex(
          (current) => {
            if (
              current === null ||
              galleryImages.length ===
                0
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

        return;
      }

      if (
        event.key === "ArrowRight"
      ) {
        setSelectedImageIndex(
          (current) => {
            if (
              current === null ||
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
  // API ERRORS
  // =========================================================

  const formatApiError = (
    data: unknown,
  ) => {
    if (
      !data ||
      typeof data !== "object"
    ) {
      return t(
        "errors.requestFailed",
      );
    }

    const errorObject =
      data as Record<
        string,
        unknown
      >;

    const firstEntry =
      Object.entries(
        errorObject,
      )[0];

    if (!firstEntry) {
      return t(
        "errors.requestFailed",
      );
    }

    const [field, value] =
      firstEntry;

    if (Array.isArray(value)) {
      return `${field}: ${value.join(
        " ",
      )}`;
    }

    if (
      typeof value === "string"
    ) {
      return value;
    }

    return t(
      "errors.requestFailed",
    );
  };

  // =========================================================
  // REQUEST COACHING
  // =========================================================

  const handleRequestCoaching = () => {
    const token =
      localStorage.getItem(
        "token",
      );

    if (!token) {
      router.push("/login");
      return;
    }

    setStatusMessage("");

    setShowRequestBox(
      (current) => !current,
    );

    if (!showRequestBox) {
      window.setTimeout(() => {
        document
          .getElementById(
            "coaching-request",
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 100);
    }
  };

  const handleSendRequest =
    async () => {
      const token =
        localStorage.getItem(
          "token",
        );

      if (!token) {
        setShowRequestBox(false);
        router.push("/login");
        return;
      }

      if (!coach) {
        return;
      }

      if (!goal.trim()) {
        setStatusMessage(
          t(
            "messages.goalRequired",
          ),
        );
        return;
      }

      try {
        setSubmitting(true);
        setStatusMessage("");

        const response =
          await fetch(
            `${API_URL}/api/requests/create/`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization:
                  `Token ${token}`,
              },
              body: JSON.stringify(
                {
                  coach: coach.id,
                  goal:
                    goal.trim(),
                  message:
                    message.trim(),
                },
              ),
            },
          );

        let data: unknown =
          null;

        try {
          data =
            await response.json();
        } catch {
          data = null;
        }

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem(
            "token",
          );

          setShowRequestBox(false);

          router.push("/login");

          return;
        }

        if (!response.ok) {
          setStatusMessage(
            formatApiError(data),
          );
          return;
        }

        setStatusMessage(
          t(
            "messages.requestSent",
          ),
        );

        setGoal("");
        setMessage("");
        setShowRequestBox(false);
      } catch {
        setStatusMessage(
          t(
            "messages.unexpectedError",
          ),
        );
      } finally {
        setSubmitting(false);
      }
    };

  // =========================================================
  // REVIEW HELPERS
  // =========================================================

  const formatReviewDate = (
    value: string,
  ) => {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
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
    ).format(date);
  };

  const getReviewerName = (
    review: Review,
  ) => {
    return (
      review.client_full_name?.trim() ||
      review.client_name?.trim() ||
      t(
        "reviews.anonymous",
      )
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="grid animate-pulse lg:grid-cols-2">
              <div className="aspect-[4/5] bg-zinc-200 sm:aspect-[16/10] lg:min-h-[500px]" />

              <div className="space-y-5 p-6 sm:p-10">
                <div className="h-4 w-24 rounded bg-zinc-200" />
                <div className="h-10 w-52 rounded bg-zinc-200" />
                <div className="h-5 w-40 rounded bg-zinc-200" />
                <div className="h-20 rounded-2xl bg-zinc-100" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!coach) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 shadow-sm">
            {t("notFound")}
          </div>
        </div>
      </main>
    );
  }

  const selectedImage =
    selectedImageIndex !== null
      ? galleryImages[
          selectedImageIndex
        ]
      : null;

  const priceLabel =
    coach.price_per_session
      ? `${coach.price_per_session} $`
      : t("contact");

  const RequestForm = () => (
    <div
      id="coaching-request"
      className="rounded-3xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6"
    >
      <div className="mb-5">
        <h3 className="text-lg font-bold text-zinc-950">
          {t(
            "form.title",
          )}
        </h3>
      </div>

      <label className="block text-sm font-semibold text-zinc-700">
        {t(
          "form.goalLabel",
        )}
      </label>

      <input
        type="text"
        value={goal}
        onChange={(
          event,
        ) =>
          setGoal(
            event.target.value,
          )
        }
        placeholder={t(
          "form.goalPlaceholder",
        )}
        className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
      />

      <label className="mt-5 block text-sm font-semibold text-zinc-700">
        {t(
          "form.messageLabel",
        )}
      </label>

      <textarea
        value={message}
        onChange={(
          event,
        ) =>
          setMessage(
            event.target.value,
          )
        }
        placeholder={t(
          "form.messagePlaceholder",
        )}
        rows={5}
        className="mt-2 w-full resize-none rounded-2xl border border-zinc-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
      />

      <button
        type="button"
        onClick={
          handleSendRequest
        }
        disabled={
          submitting
        }
        className="mt-5 w-full rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? t(
              "form.sending",
            )
          : t(
              "form.send",
            )}
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-zinc-50 pb-28 lg:pb-16">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:py-12">
        {statusMessage && (
          <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-sm font-medium text-zinc-700">
            {statusMessage}
          </div>
        )}

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_15px_50px_rgba(0,0,0,0.06)] sm:rounded-[36px]">
          <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
            {/* PHOTO */}

            <div className="relative min-h-[430px] overflow-hidden bg-zinc-100 sm:min-h-[520px] lg:min-h-[590px]">
              {coach.photo_url ? (
                <img
                  src={
                    coach.photo_url
                  }
                  alt={
                    coach.full_name
                  }
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
                  <span className="text-8xl font-black text-white/90">
                    {coach.full_name
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/65 via-black/20 to-transparent lg:hidden" />

              {coach.is_verified && (
                <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/95 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-lg backdrop-blur sm:left-6 sm:top-6">
                  ✓{" "}
                  {t(
                    "verified",
                  )}
                </div>
              )}

              {/* Mobile name overlay */}

              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7 lg:hidden">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {
                    coach.full_name
                  }
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/90">
                  <span>
                    {
                      coach.specialty
                    }
                  </span>

                  <span className="text-white/50">
                    •
                  </span>

                  <span>
                    📍{" "}
                    {
                      coach.city
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* PROFILE SUMMARY */}

            <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-12 xl:p-14">
              <div className="hidden lg:block">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                    {
                      coach.specialty
                    }
                  </p>

                  {coach.is_verified && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      ✓{" "}
                      {t(
                        "verified",
                      )}
                    </span>
                  )}
                </div>

                <h1 className="mt-4 text-5xl font-black tracking-[-0.04em] text-zinc-950 xl:text-6xl">
                  {
                    coach.full_name
                  }
                </h1>

                <p className="mt-4 text-lg font-medium text-zinc-500">
                  📍{" "}
                  {
                    coach.city
                  }
                </p>
              </div>

              {/* Rating */}

              <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 pb-5 lg:mt-7">
                {coach.reviews_count >
                  0 &&
                coach.average_rating !==
                  null ? (
                  <>
                    <RatingStars
                      rating={
                        coach.average_rating
                      }
                      size="text-lg"
                    />

                    <span className="font-bold text-zinc-900">
                      {coach.average_rating.toFixed(
                        1,
                      )}
                    </span>

                    <span className="text-sm text-zinc-500">
                      {t(
                        "reviews.count",
                        {
                          count:
                            coach.reviews_count,
                        },
                      )}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-zinc-500">
                    {t(
                      "reviews.noReviews",
                    )}
                  </span>
                )}
              </div>

              {/* Main facts */}

              <div className="grid grid-cols-2 gap-3 py-5">
                {coach.years_experience !==
                  undefined && (
                  <div className="rounded-2xl bg-zinc-50 p-4">
                    <div className="text-xl">
                      🏆
                    </div>

                    <p className="mt-2 text-sm font-bold text-zinc-900">
                      {t(
                        "yearsExperience",
                        {
                          count:
                            coach.years_experience,
                        },
                      )}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl bg-zinc-50 p-4">
                  <div className="text-xl">
                    📍
                  </div>

                  <p className="mt-2 text-sm font-bold text-zinc-900">
                    {
                      coach.city
                    }
                  </p>
                </div>
              </div>

              {/* Training modes */}

              <div className="flex flex-wrap gap-2">
                {coach.available_in_person && (
                  <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    ✓{" "}
                    {t(
                      "inPersonAvailable",
                    )}
                  </span>
                )}

                {coach.available_online && (
                  <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    ✓{" "}
                    {t(
                      "onlineAvailable",
                    )}
                  </span>
                )}
              </div>

              {/* Gym */}

              {coach.gym_name && (
                <div className="mt-6 rounded-2xl border border-zinc-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    {t(
                      "worksAt",
                    )}
                  </p>

                  {coach.gym_slug ? (
                    <Link
                      href={`/gyms/${coach.gym_slug}`}
                      className="mt-1 inline-flex items-center gap-2 font-bold text-zinc-900 transition hover:text-primary"
                    >
                      {
                        coach.gym_name
                      }
                      <span>
                        →
                      </span>
                    </Link>
                  ) : (
                    <p className="mt-1 font-bold text-zinc-900">
                      {
                        coach.gym_name
                      }
                    </p>
                  )}
                </div>
              )}

              {/* Price + CTA */}

              <div className="mt-7 rounded-3xl bg-zinc-950 p-5 text-white sm:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-white/60">
                      {t(
                        "startingFrom",
                      )}
                    </p>

                    <p className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
                      {
                        priceLabel
                      }
                    </p>

                    {coach.price_per_session && (
                      <p className="mt-1 text-xs text-white/60">
                        {t(
                          "perSession",
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleRequestCoaching
                  }
                  className="mt-5 w-full rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-white transition hover:bg-primary-dark"
                >
                  {showRequestBox
                    ? t(
                        "closeRequestForm",
                      )
                    : t(
                        "requestCoaching",
                      )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile/tablet form */}

        {showRequestBox && (
          <div className="mt-5 lg:hidden">
            <RequestForm />
          </div>
        )}

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            {/* ABOUT */}

            <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="mb-5 h-1.5 w-12 rounded-full bg-primary" />

              <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                {t(
                  "aboutTitle",
                )}
              </h2>

              <p className="mt-5 whitespace-pre-line text-[15px] leading-8 text-zinc-600 sm:text-base">
                {coach.bio ||
                  t(
                    "noDescription",
                  )}
              </p>
            </section>

            {/* TRAINING INFO */}

            <section className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl">
                  🏋️
                </div>

                <h2 className="mt-5 text-lg font-black text-zinc-950">
                  {t(
                    "formatTitle",
                  )}
                </h2>

                <div className="mt-4 space-y-3 text-sm text-zinc-600">
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        coach.available_in_person
                          ? "font-bold text-emerald-600"
                          : "text-zinc-400"
                      }
                    >
                      {coach.available_in_person
                        ? "✓"
                        : "—"}
                    </span>

                    <span>
                      {coach.available_in_person
                        ? t(
                            "inPersonAvailable",
                          )
                        : t(
                            "inPersonUnavailable",
                          )}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <span
                      className={
                        coach.available_online
                          ? "font-bold text-emerald-600"
                          : "text-zinc-400"
                      }
                    >
                      {coach.available_online
                        ? "✓"
                        : "—"}
                    </span>

                    <span>
                      {coach.available_online
                        ? t(
                            "onlineAvailable",
                          )
                        : t(
                            "onlineUnavailable",
                          )}
                    </span>
                  </div>
                </div>
              </article>

              <article className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl">
                  🎯
                </div>

                <h2 className="mt-5 text-lg font-black text-zinc-950">
                  {t(
                    "specialtyTitle",
                  )}
                </h2>

                <p className="mt-4 text-sm leading-7 text-zinc-600">
                  {t.rich(
                    "specialtyDescription",
                    {
                      specialty:
                        coach.specialty,

                      strong: (
                        chunks,
                      ) => (
                        <strong className="font-bold text-zinc-900">
                          {
                            chunks
                          }
                        </strong>
                      ),
                    },
                  )}
                </p>
              </article>
            </section>

            {/* GALLERY */}

            {galleryImages.length >
              0 && (
              <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="mb-4 h-1.5 w-12 rounded-full bg-primary" />

                    <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                      {t(
                        "gallery",
                      )}
                    </h2>
                  </div>

                  <span className="text-sm font-medium text-zinc-400">
                    {
                      galleryImages.length
                    }
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-4">
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
                        className={`group relative overflow-hidden rounded-2xl bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          index === 0 &&
                          galleryImages.length >
                            2
                            ? "col-span-2 aspect-[16/9]"
                            : "aspect-square sm:aspect-[4/3]"
                        }`}
                      >
                        <img
                          src={
                            item.image_url
                          }
                          alt={
                            item.caption ||
                            t(
                              "galleryImageAlt",
                            )
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                        {item.caption && (
                          <p className="absolute inset-x-0 bottom-0 translate-y-3 px-4 pb-4 text-left text-sm font-medium text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                            {
                              item.caption
                            }
                          </p>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </section>
            )}

            {/* VIDEOS */}

            {(videosLoading ||
              videos.length > 0) && (
              <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="mb-4 h-1.5 w-12 rounded-full bg-primary" />

                    <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                      {t(
                        "videos.title",
                      )}
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                      {t(
                        "videos.description",
                      )}
                    </p>
                  </div>

                  {videos.length > 0 && (
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
                            className="group overflow-hidden rounded-3xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                                  {t(
                                    "videos.noThumbnail",
                                  )}
                                </div>
                              )}

                              <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/25">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl text-primary shadow-xl transition group-hover:scale-110">
                                  ▶
                                </div>
                              </div>
                            </div>

                            <div className="p-5">
                              <h3 className="font-bold text-zinc-950">
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

            {/* REVIEWS */}

            <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mb-4 h-1.5 w-12 rounded-full bg-primary" />

                  <h2 className="text-2xl font-black tracking-tight text-zinc-950">
                    {t(
                      "reviews.title",
                    )}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    {coach.reviews_count >
                    0
                      ? t(
                          "reviews.count",
                          {
                            count:
                              coach.reviews_count,
                          },
                        )
                      : t(
                          "reviews.noReviews",
                        )}
                  </p>
                </div>

                {coach.average_rating !==
                  null &&
                  coach.reviews_count >
                    0 && (
                    <div>
                      <p className="text-3xl font-black text-zinc-950">
                        {coach.average_rating.toFixed(
                          1,
                        )}
                      </p>

                      <RatingStars
                        rating={
                          coach.average_rating
                        }
                        size="text-lg"
                      />
                    </div>
                  )}
              </div>

              {reviewsLoading ? (
                <div className="mt-6 rounded-2xl bg-zinc-50 p-5 text-sm text-zinc-500">
                  {t(
                    "reviews.loading",
                  )}
                </div>
              ) : reviews.length ===
                0 ? (
                <div className="mt-6 rounded-2xl bg-zinc-50 p-6 text-sm text-zinc-500">
                  {t(
                    "reviews.empty",
                  )}
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {reviews.map(
                    (review) => (
                      <article
                        key={
                          review.id
                        }
                        className="rounded-3xl border border-zinc-200 p-5 sm:p-6"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-black text-primary">
                              {getReviewerName(
                                review,
                              )
                                .charAt(
                                  0,
                                )
                                .toUpperCase()}
                            </div>

                            <div>
                              <p className="font-bold text-zinc-950">
                                {getReviewerName(
                                  review,
                                )}
                              </p>

                              <RatingStars
                                rating={
                                  review.rating
                                }
                                size="text-sm"
                              />
                            </div>
                          </div>

                          <time className="text-xs text-zinc-400">
                            {formatReviewDate(
                              review.created_at,
                            )}
                          </time>
                        </div>

                        {review.comment?.trim() && (
                          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-600">
                            {
                              review.comment
                            }
                          </p>
                        )}
                      </article>
                    ),
                  )}
                </div>
              )}
            </section>
          </div>

          {/* =====================================================
              DESKTOP SIDEBAR
          ====================================================== */}

          <aside className="hidden h-fit lg:sticky lg:top-24 lg:block">
            <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">
                {t(
                  "startingFrom",
                )}
              </p>

              <p className="mt-2 text-3xl font-black tracking-tight text-zinc-950">
                {
                  priceLabel
                }
              </p>

              {coach.price_per_session && (
                <p className="mt-1 text-sm text-zinc-500">
                  {t(
                    "perSession",
                  )}
                </p>
              )}

              <button
                type="button"
                onClick={
                  handleRequestCoaching
                }
                className="mt-6 w-full rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark"
              >
                {showRequestBox
                  ? t(
                      "closeRequestForm",
                    )
                  : t(
                      "requestCoaching",
                    )}
              </button>

              <div className="mt-6 space-y-4 border-t border-zinc-100 pt-6 text-sm text-zinc-600">
                <div className="flex gap-3">
                  <span className="font-bold text-emerald-600">
                    ✓
                  </span>

                  <span>
                    {t(
                      "benefits.directRequest",
                    )}
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="font-bold text-emerald-600">
                    ✓
                  </span>

                  <span>
                    {t(
                      "benefits.quickContact",
                    )}
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="font-bold text-emerald-600">
                    ✓
                  </span>

                  <span>
                    {t(
                      "benefits.clearRequests",
                    )}
                  </span>
                </div>
              </div>
            </div>

            {showRequestBox && (
              <div className="mt-5">
                <RequestForm />
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* =====================================================
          MOBILE STICKY CTA
      ====================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-zinc-950">
              {
                coach.full_name
              }
            </p>

            <p className="truncate text-xs text-zinc-500">
              {coach.price_per_session
                ? `${priceLabel} · ${t(
                    "perSession",
                  )}`
                : priceLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleRequestCoaching
            }
            className="shrink-0 rounded-2xl bg-primary px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition active:scale-[0.98]"
          >
            {t(
              "requestCoaching",
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          LIGHTBOX
      ====================================================== */}

      {selectedImage &&
        selectedImageIndex !==
          null && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-6"
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
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur transition hover:bg-white/20"
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
                  className="absolute left-1 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-3xl text-white backdrop-blur transition hover:bg-black/80 sm:left-4 sm:h-12 sm:w-12"
                >
                  ‹
                </button>
              )}

              <div className="flex max-h-full max-w-full flex-col items-center">
                <img
                  src={
                    selectedImage.image_url
                  }
                  alt={
                    selectedImage.caption ||
                    t(
                      "galleryImageAlt",
                    )
                  }
                  className="max-h-[84vh] max-w-full rounded-2xl object-contain shadow-2xl"
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
                  className="absolute right-1 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-3xl text-white backdrop-blur transition hover:bg-black/80 sm:right-4 sm:h-12 sm:w-12"
                >
                  ›
                </button>
              )}
            </div>
          </div>
        )}
    </main>
  );
}