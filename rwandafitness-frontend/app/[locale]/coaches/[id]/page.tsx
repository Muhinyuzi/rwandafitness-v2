"use client";

import {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import {useLocale, useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";
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

function isPaginatedReviews(data: unknown): data is PaginatedReviews {
  if (!data || typeof data !== "object") {
    return false;
  }

  const value = data as Record<string, unknown>;

  return Array.isArray(value.results);
}

function RatingStars({
  rating,
  size = "text-xl",
}: {
  rating: number;
  size?: string;
}) {
  const normalizedRating = Math.max(0, Math.min(5, rating));
  const roundedRating = Math.round(normalizedRating);

  return (
    <div
      className={`flex items-center gap-0.5 ${size}`}
      aria-label={`${normalizedRating.toFixed(1)} / 5`}
    >
      {Array.from({length: 5}, (_, index) => {
        const filled = index < roundedRating;

        return (
          <span
            key={index}
            className={filled ? "text-amber-400" : "text-zinc-300"}
            aria-hidden="true"
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default function CoachDetailPage() {
  const locale = useLocale();
  const t = useTranslations("CoachDetail");
  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [coach, setCoach] = useState<Coach | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showRequestBox, setShowRequestBox] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadCoach = async () => {
      try {
        setLoading(true);
        setCoach(null);

        const response = await fetch(
          `${API_URL}/api/coaches/${encodeURIComponent(id)}/?lang=${locale}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Coach not found");
        }

        const data: Coach = await response.json();

        setCoach(data);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setCoach(null);
      } finally {
        if (!controller.signal.aborted) {
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

  useEffect(() => {
    const controller = new AbortController();

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviews([]);

        const response = await fetch(
          `${API_URL}/api/reviews/?coach=${encodeURIComponent(id)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load reviews");
        }

        const data: unknown = await response.json();

        if (Array.isArray(data)) {
          setReviews(data as Review[]);
          return;
        }

        if (isPaginatedReviews(data)) {
          setReviews(data.results);
          return;
        }

        setReviews([]);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setReviews([]);
      } finally {
        if (!controller.signal.aborted) {
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

  const formatApiError = (data: unknown) => {
    if (!data || typeof data !== "object") {
      return t("errors.requestFailed");
    }

    const errorObject = data as Record<string, unknown>;
    const firstEntry = Object.entries(errorObject)[0];

    if (!firstEntry) {
      return t("errors.requestFailed");
    }

    const [field, value] = firstEntry;

    if (Array.isArray(value)) {
      return `${field}: ${value.join(" ")}`;
    }

    if (typeof value === "string") {
      return value;
    }

    return t("errors.requestFailed");
  };

  const handleSendRequest = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatusMessage(t("messages.loginRequired"));
      return;
    }

    if (!coach) {
      return;
    }

    if (!goal.trim()) {
      setStatusMessage(t("messages.goalRequired"));
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage("");

      const response = await fetch(`${API_URL}/api/requests/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          coach: coach.id,
          goal: goal.trim(),
          message: message.trim(),
        }),
      });

      let data: unknown = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setStatusMessage(formatApiError(data));
        return;
      }

      setStatusMessage(t("messages.requestSent"));
      setGoal("");
      setMessage("");
      setShowRequestBox(false);
    } catch {
      setStatusMessage(t("messages.unexpectedError"));
    } finally {
      setSubmitting(false);
    }
  };

  const formatReviewDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getReviewerName = (review: Review) => {
    return (
      review.client_full_name?.trim() ||
      review.client_name?.trim() ||
      t("reviews.anonymous")
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("loading")}
        </div>
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("notFound")}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {statusMessage && (
        <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          {statusMessage}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-8">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="mb-4 h-1.5 w-16 rounded-full bg-primary" />

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {coach.photo_url ? (
                <img
                  src={coach.photo_url}
                  alt={coach.full_name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
                  {coach.full_name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
                    {coach.full_name}
                  </h1>

                  {coach.is_verified && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      ✔ {t("verified")}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {coach.reviews_count > 0 &&
                  coach.average_rating !== null ? (
                    <>
                      <RatingStars
                        rating={coach.average_rating}
                        size="text-lg"
                      />

                      <span className="text-sm font-semibold text-zinc-900">
                        {coach.average_rating.toFixed(1)}
                      </span>

                      <span className="text-sm text-zinc-500">
                        {t("reviews.count", {
                          count: coach.reviews_count,
                        })}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-zinc-500">
                      {t("reviews.noReviews")}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {coach.specialty}
                  </span>

                  <span>📍 {coach.city}</span>

                  {coach.years_experience !== undefined && (
                    <span>
                      {t("yearsExperience", {
                        count: coach.years_experience,
                      })}
                    </span>
                  )}
                </div>

                {coach.gym_name && (
                  <p className="mt-3 text-sm text-zinc-600">
                    {t("worksAt")}{" "}
                    {coach.gym_slug ? (
                      <Link
                        href={`/gyms/${coach.gym_slug}`}
                        className="font-medium underline"
                      >
                        {coach.gym_name}
                      </Link>
                    ) : (
                      <span className="font-medium">{coach.gym_name}</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-zinc-900">
                {t("aboutTitle")}
              </h2>

              <p className="mt-3 whitespace-pre-line leading-8 text-zinc-600">
                {coach.bio || t("noDescription")}
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-zinc-50 p-5">
                <h3 className="text-sm font-semibold text-zinc-900">
                  {t("formatTitle")}
                </h3>

                <div className="mt-3 space-y-2 text-sm text-zinc-600">
                  <p>
                    {coach.available_online
                      ? t("onlineAvailable")
                      : t("onlineUnavailable")}
                  </p>

                  <p>
                    {coach.available_in_person
                      ? t("inPersonAvailable")
                      : t("inPersonUnavailable")}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-50 p-5">
                <h3 className="text-sm font-semibold text-zinc-900">
                  {t("specialtyTitle")}
                </h3>

                <p className="mt-3 text-sm leading-7 text-zinc-600">
                  {t.rich("specialtyDescription", {
                    specialty: coach.specialty,
                    strong: (chunks) => <strong>{chunks}</strong>,
                  })}
                </p>
              </div>
            </div>

            {coach.gallery_images && coach.gallery_images.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-semibold text-zinc-900">
                  {t("gallery")}
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {coach.gallery_images.map((item) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.caption || t("galleryImageAlt")}
                          className="h-48 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
                          {t("galleryImageAlt")}
                        </div>
                      )}

                      {item.caption && (
                        <div className="p-3 text-sm text-zinc-600">
                          {item.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">
                  {t("reviews.title")}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {coach.reviews_count > 0
                    ? t("reviews.count", {
                        count: coach.reviews_count,
                      })
                    : t("reviews.noReviews")}
                </p>
              </div>

              {coach.average_rating !== null &&
                coach.reviews_count > 0 && (
                  <div className="flex items-center gap-3">
                    <RatingStars
                      rating={coach.average_rating}
                      size="text-xl"
                    />

                    <span className="text-lg font-bold text-zinc-900">
                      {coach.average_rating.toFixed(1)}
                    </span>
                  </div>
                )}
            </div>

            {reviewsLoading ? (
              <div className="mt-6 rounded-2xl bg-zinc-50 p-5 text-sm text-zinc-500">
                {t("reviews.loading")}
              </div>
            ) : reviews.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-zinc-50 p-5 text-sm text-zinc-500">
                {t("reviews.empty")}
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-zinc-200 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {getReviewerName(review)}
                        </p>

                        <div className="mt-1">
                          <RatingStars
                            rating={review.rating}
                            size="text-base"
                          />
                        </div>
                      </div>

                      <time className="text-xs text-zinc-500">
                        {formatReviewDate(review.created_at)}
                      </time>
                    </div>

                    {review.comment?.trim() && (
                      <p className="mt-4 whitespace-pre-line leading-7 text-zinc-600">
                        {review.comment}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <p className="text-sm text-zinc-500">{t("startingFrom")}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            {coach.price_per_session
              ? `${coach.price_per_session} $`
              : t("contact")}
          </p>

          <p className="mt-1 text-sm text-zinc-500">{t("perSession")}</p>

          <button
            type="button"
            onClick={() => setShowRequestBox((current) => !current)}
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {showRequestBox
              ? t("closeRequestForm")
              : t("requestCoaching")}
          </button>

          <div className="mt-6 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
            <p className="mb-2">✔ {t("benefits.directRequest")}</p>
            <p className="mb-2">✔ {t("benefits.quickContact")}</p>
            <p>✔ {t("benefits.clearRequests")}</p>
          </div>

          {showRequestBox && (
            <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
              <h3 className="text-base font-semibold text-zinc-900">
                {t("form.title")}
              </h3>

              <label className="mt-4 block text-sm font-medium text-zinc-700">
                {t("form.goalLabel")}
              </label>

              <input
                type="text"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder={t("form.goalPlaceholder")}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-primary"
              />

              <label className="mt-4 block text-sm font-medium text-zinc-700">
                {t("form.messageLabel")}
              </label>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t("form.messagePlaceholder")}
                rows={5}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-primary"
              />

              <button
                type="button"
                onClick={handleSendRequest}
                disabled={submitting}
                className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? t("form.sending") : t("form.send")}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}