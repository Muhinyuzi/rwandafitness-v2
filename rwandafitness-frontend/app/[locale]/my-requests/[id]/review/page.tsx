"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {useParams} from "next/navigation";
import {useTranslations} from "next-intl";

import {Link, useRouter} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type RequestDetail = {
  id: number;
  coach_name: string;
  goal: string;
  status: string;
  has_review: boolean;
  review_id: number | null;
};

type ReviewErrorResponse = {
  detail?: string;
  request?: string[] | string;
  rating?: string[] | string;
  comment?: string[] | string;
  non_field_errors?: string[] | string;
};

export default function ReviewPage() {
  const t = useTranslations("ReviewForm");
  const router = useRouter();
  const params = useParams<{id: string}>();

  const requestId = Number(params.id);

  const [requestDetail, setRequestDetail] =
    useState<RequestDetail | null>(null);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAuthError = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    window.dispatchEvent(new Event("auth-changed"));

    router.replace("/login");
  }, [router]);

  const getErrorMessage = (
    data: ReviewErrorResponse
  ): string | null => {
    const possibleErrors = [
      data.detail,
      data.request,
      data.rating,
      data.comment,
      data.non_field_errors,
    ];

    for (const value of possibleErrors) {
      if (typeof value === "string") {
        return value;
      }

      if (Array.isArray(value) && value.length > 0) {
        return value[0];
      }
    }

    return null;
  };

  const loadRequest = useCallback(
    async (signal?: AbortSignal) => {
      const token = localStorage.getItem("token");

      if (!token) {
        handleAuthError();
        return;
      }

      if (
        !Number.isInteger(requestId) ||
        requestId <= 0
      ) {
        setError(t("messages.notFound"));
        return;
      }

      try {
        setError("");

        const response = await fetch(
          `${API_URL}/api/requests/${requestId}/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
            signal,
            cache: "no-store",
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleAuthError();
          return;
        }

        if (response.status === 404) {
          setError(t("messages.notFound"));
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load request");
        }

        const data: RequestDetail = await response.json();

        setRequestDetail(data);
      } catch (caughtError) {
        if (
          caughtError instanceof Error &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError(t("messages.loadFailed"));
      }
    },
    [handleAuthError, requestId, t]
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadPage = async () => {
      setLoading(true);

      try {
        await loadRequest(controller.signal);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadPage();

    return () => {
      controller.abort();
    };
  }, [loadRequest]);

  const submitReview = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!requestDetail) {
      return;
    }

    if (rating < 1 || rating > 5) {
      setError(t("messages.ratingRequired"));
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      handleAuthError();
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/reviews/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            request: requestDetail.id,
            rating,
            comment: comment.trim(),
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        const data: ReviewErrorResponse =
          await response.json().catch(() => ({}));

        const apiMessage = getErrorMessage(data);

        throw new Error(
          apiMessage || t("messages.submitFailed")
        );
      }

      router.replace("/my-requests");
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError(t("messages.submitFailed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const displayedRating = hoveredRating || rating;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("loading")}
        </div>
      </div>
    );
  }

  if (error && !requestDetail) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/my-requests"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← {t("back")}
        </Link>

        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700"
        >
          {error}
        </div>
      </div>
    );
  }

  if (!requestDetail) {
    return null;
  }

  if (requestDetail.status !== "completed") {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/my-requests"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← {t("back")}
        </Link>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          {t("messages.notCompleted")}
        </div>
      </div>
    );
  }

  if (requestDetail.has_review) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href="/my-requests"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← {t("back")}
        </Link>

        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
          <h1 className="text-xl font-semibold text-green-900">
            {t("alreadySubmitted.title")}
          </h1>

          <p className="mt-2 text-sm text-green-700">
            {t("alreadySubmitted.description")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/my-requests"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← {t("back")}
        </Link>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-4 h-1.5 w-16 rounded-full bg-primary" />

        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {t("title")}
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-600">
          {t("description")}
        </p>

        <div className="mt-6 rounded-2xl bg-zinc-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t("service")}
          </p>

          <p className="mt-2 text-lg font-semibold text-zinc-900">
            {requestDetail.goal}
          </p>

          <p className="mt-1 text-sm text-zinc-600">
            {t("coach", {
              name: requestDetail.coach_name,
            })}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={submitReview}
          className="mt-8 space-y-7"
        >
          <fieldset>
            <legend className="text-sm font-semibold text-zinc-900">
              {t("rating.label")}
            </legend>

            <p className="mt-1 text-sm text-zinc-500">
              {t("rating.help")}
            </p>

            <div
              className="mt-4 flex gap-2"
              onMouseLeave={() => setHoveredRating(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() =>
                    setHoveredRating(value)
                  }
                  aria-label={t("rating.starLabel", {
                    value,
                  })}
                  aria-pressed={rating === value}
                  className="rounded-lg p-1 text-4xl transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span
                    className={
                      value <= displayedRating
                        ? "text-amber-400"
                        : "text-zinc-300"
                    }
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="mt-2 text-sm font-medium text-zinc-700">
                {t("rating.selected", {
                  rating,
                })}
              </p>
            )}
          </fieldset>

          <div>
            <label
              htmlFor="comment"
              className="text-sm font-semibold text-zinc-900"
            >
              {t("comment.label")}
            </label>

            <p className="mt-1 text-sm text-zinc-500">
              {t("comment.help")}
            </p>

            <textarea
              id="comment"
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              rows={6}
              maxLength={1000}
              placeholder={t("comment.placeholder")}
              className="mt-3 w-full resize-y rounded-2xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <p className="mt-2 text-right text-xs text-zinc-400">
              {comment.length}/1000
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/my-requests"
              className="rounded-xl border border-zinc-300 px-5 py-2.5 text-center text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              {t("actions.cancel")}
            </Link>

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? t("actions.submitting")
                : t("actions.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}