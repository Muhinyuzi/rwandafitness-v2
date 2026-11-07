"use client";

import {FormEvent, useCallback, useEffect, useState} from "react";
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

  const [requestDetail, setRequestDetail] = useState<RequestDetail | null>(null);
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

  const getErrorMessage = (data: ReviewErrorResponse): string | null => {
    const possibleErrors = [
      data.detail, data.request, data.rating, data.comment, data.non_field_errors,
    ];
    for (const value of possibleErrors) {
      if (typeof value === "string") return value;
      if (Array.isArray(value) && value.length > 0) return value[0];
    }
    return null;
  };

  const loadRequest = useCallback(async (signal?: AbortSignal) => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleAuthError();
      return;
    }
    if (!Number.isInteger(requestId) || requestId <= 0) {
      setError(t("messages.notFound"));
      return;
    }
    try {
      setError("");
      const response = await fetch(`${API_URL}/api/requests/${requestId}/`, {
        headers: {Authorization: `Token ${token}`},
        signal,
        cache: "no-store",
      });
      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }
      if (response.status === 404) {
        setError(t("messages.notFound"));
        return;
      }
      if (!response.ok) throw new Error("Failed to load request");
      const data: RequestDetail = await response.json();
      if (!signal?.aborted) setRequestDetail(data);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.name === "AbortError") return;
      if (!signal?.aborted) setError(t("messages.loadFailed"));
    }
  }, [handleAuthError, requestId, t]);

  useEffect(() => {
    const controller = new AbortController();
    const loadPage = async () => {
      setLoading(true);
      try {
        await loadRequest(controller.signal);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadPage();
    return () => controller.abort();
  }, [loadRequest]);

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!requestDetail || submitting) return;
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
      const response = await fetch(`${API_URL}/api/reviews/`, {
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
      });
      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }
      if (!response.ok) {
        const data: ReviewErrorResponse = await response.json().catch(() => ({}));
        throw new Error(getErrorMessage(data) || t("messages.submitFailed"));
      }
      router.replace("/my-requests");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t("messages.submitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const displayedRating = hoveredRating || rating;
  const backLink = (
    <Link href="/my-requests" className="inline-flex items-center gap-2 text-sm font-semibold text-[#075C38] transition hover:text-[#007D36] hover:underline">
      <span aria-hidden="true">←</span> {t("back")}
    </Link>
  );

  if (loading) {
    return (
      <main className="min-h-[75vh] bg-[#F3FAF6] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="animate-pulse rounded-[32px] border border-[#DCEDE2] bg-white p-8 shadow-sm">
            <div className="h-2 w-20 rounded-full bg-[#FFD21A]" />
            <div className="mt-7 h-9 w-2/3 rounded-xl bg-[#E3F1E8]" />
            <div className="mt-5 h-5 w-1/2 rounded-lg bg-[#EAF5EE]" />
            <p className="mt-8 text-sm text-[#52675B]" role="status">{t("loading")}</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !requestDetail) {
    return (
      <main className="min-h-[70vh] bg-[#F3FAF6] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {backLink}
          <div role="alert" className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-7 text-sm text-red-800 shadow-sm">{error}</div>
        </div>
      </main>
    );
  }

  if (!requestDetail) return null;

  if (requestDetail.status !== "completed") {
    return (
      <main className="min-h-[70vh] bg-[#F3FAF6] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {backLink}
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-sm font-medium text-amber-900 shadow-sm">{t("messages.notCompleted")}</div>
        </div>
      </main>
    );
  }

  if (requestDetail.has_review) {
    return (
      <main className="min-h-[70vh] bg-[#F3FAF6] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          {backLink}
          <div className="mt-6 overflow-hidden rounded-[32px] border border-[#CBE7D5] bg-white shadow-[0_20px_60px_rgba(0,61,36,0.07)]">
            <div className="h-2 bg-[#007D36]" />
            <div className="p-8 sm:p-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F6EC] text-3xl font-bold text-[#007D36]" aria-hidden="true">✓</span>
              <h1 className="mt-5 text-2xl font-black text-[#003D24]">{t("alreadySubmitted.title")}</h1>
              <p className="mt-3 text-sm leading-7 text-[#52675B]">{t("alreadySubmitted.description")}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F3FAF6] pb-16">
      <section className="relative overflow-hidden bg-[#003D24] px-4 pb-24 pt-10 text-white sm:px-6 sm:pb-28 sm:pt-14">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-[#00CFFF]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-[#007D36]/50 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <Link href="/my-requests" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-[#FFD21A]">
            <span aria-hidden="true">←</span> {t("back")}
          </Link>
          <div className="mt-9 inline-flex items-center gap-2 rounded-full border border-[#FFD21A]/40 bg-[#FFD21A]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#FFD21A]">
            <span className="h-2 w-2 rounded-full bg-[#00CFFF]" /> RwandaFitness
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">{t("description")}</p>
        </div>
      </section>

      <section className="relative mx-auto -mt-14 max-w-3xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[32px] border border-[#DCEDE2] bg-white shadow-[0_22px_70px_rgba(0,61,36,0.10)]">
          <div className="border-b border-[#E1EFE7] bg-gradient-to-r from-[#EAF7EF] to-white p-6 sm:p-8">
            <div className="mb-4 h-1.5 w-14 rounded-full bg-[#FFD21A]" />
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#007D36]">{t("service")}</p>
            <h2 className="mt-3 text-xl font-black leading-snug text-[#003D24] sm:text-2xl">{requestDetail.goal}</h2>
            <p className="mt-2 text-sm text-[#52675B]">{t("coach", {name: requestDetail.coach_name})}</p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div role="alert" className="mb-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">{error}</div>
            )}
            <form onSubmit={submitReview} className="space-y-8">
              <fieldset>
                <legend className="text-base font-bold text-[#17251E]">{t("rating.label")}</legend>
                <p className="mt-2 text-sm leading-6 text-[#52675B]">{t("rating.help")}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3" onMouseLeave={() => setHoveredRating(0)}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      onMouseEnter={() => setHoveredRating(value)}
                      onFocus={() => setHoveredRating(value)}
                      onBlur={() => setHoveredRating(0)}
                      aria-label={t("rating.starLabel", {value})}
                      aria-pressed={rating === value}
                      disabled={submitting}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DCEDE2] bg-[#F3FAF6] text-3xl transition hover:-translate-y-1 hover:border-[#FFD21A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00CFFF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:w-14 sm:text-4xl"
                    >
                      <span aria-hidden="true" className={value <= displayedRating ? "text-[#E7AD00]" : "text-[#C8D9CE]"}>★</span>
                    </button>
                  ))}
                </div>
                {rating > 0 && <p className="mt-4 text-sm font-semibold text-[#075C38]" aria-live="polite">{t("rating.selected", {rating})}</p>}
              </fieldset>

              <div>
                <label htmlFor="comment" className="block text-base font-bold text-[#17251E]">{t("comment.label")}</label>
                <p className="mt-2 text-sm leading-6 text-[#52675B]">{t("comment.help")}</p>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={6}
                  maxLength={1000}
                  disabled={submitting}
                  placeholder={t("comment.placeholder")}
                  className="mt-4 w-full resize-y rounded-2xl border border-[#CADFD1] bg-[#FBFDFB] px-5 py-4 text-sm leading-7 text-[#17251E] outline-none transition placeholder:text-[#82978A] focus:border-[#007D36] focus:ring-4 focus:ring-[#00CFFF]/15 disabled:opacity-60"
                />
                <p className="mt-2 text-right text-xs font-medium tabular-nums text-[#71877A]">{comment.length}/1000</p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E1EFE7] pt-7 sm:flex-row sm:justify-end">
                <Link href="/my-requests" className="rounded-2xl border border-[#CADFD1] px-6 py-3.5 text-center text-sm font-bold text-[#075C38] transition hover:bg-[#EAF7EF]">{t("actions.cancel")}</Link>
                <button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="rounded-2xl bg-[#FFD21A] px-7 py-3.5 text-sm font-extrabold text-[#003D24] shadow-[0_8px_24px_rgba(255,210,26,0.22)] transition hover:bg-[#FFE052] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00CFFF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {submitting ? t("actions.submitting") : t("actions.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
