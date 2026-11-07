"use client";

import {useCallback, useEffect, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useParams} from "next/navigation";

import {Link, useRouter} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type RequestDetail = {
  id: number;
  client_name: string;
  client_email: string;
  coach_name: string;
  coach_email: string;
  goal: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function RequestDetailPage() {
  const t = useTranslations("RequestDetail");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{id: string}>();
  const id = params.id;

  const [requestDetail, setRequestDetail] = useState<RequestDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-changed"));
    router.replace("/login");
  }, [router]);

  const loadRequest = useCallback(async (signal?: AbortSignal) => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleAuthError();
      return;
    }

    try {
      setError("");
      const response = await fetch(`${API_URL}/api/requests/${id}/`, {
        headers: {Authorization: `Token ${token}`},
        signal,
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }
      if (response.status === 404) {
        setRequestDetail(null);
        setError(t("messages.notFound"));
        return;
      }
      if (!response.ok) throw new Error("Failed to load request");

      const data: RequestDetail = await response.json();
      setRequestDetail(data);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.name === "AbortError") return;
      setError(t("messages.loadFailed"));
    }
  }, [handleAuthError, id, t]);

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
    if (id) void loadPage();
    return () => controller.abort();
  }, [id, loadRequest]);

  const updateStatus = async (status: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleAuthError();
      return;
    }
    try {
      setUpdating(true);
      setError("");
      const response = await fetch(`${API_URL}/api/requests/${id}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({status}),
      });
      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }
      if (!response.ok) throw new Error("Failed to update request");
      await loadRequest();
    } catch {
      setError(t("messages.updateFailed"));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusClasses = (status: string) => {
    if (status === "accepted") return "border-emerald-200 bg-emerald-50 text-emerald-800";
    if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
    if (status === "completed") return "border-cyan-200 bg-cyan-50 text-[#075C38]";
    return "border-amber-200 bg-amber-50 text-amber-800";
  };

  const formatStatus = (status: string) => {
    if (status === "accepted") return t("statuses.accepted");
    if (status === "rejected") return t("statuses.rejected");
    if (status === "completed") return t("statuses.completed");
    return t("statuses.pending");
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return t("invalidDate");
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsedDate);
  };

  return (
    <main className="min-h-screen bg-[#F3FAF6] pb-16 text-[#17251E]">
      <section className="relative overflow-hidden bg-[#003D24] px-5 pb-20 pt-10 text-white sm:px-8 sm:pb-24 sm:pt-14">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[55px] border-[#00CFFF]/10" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-[#007D36]/40 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <Link href="/my-requests" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-[#00CFFF] hover:text-[#00CFFF]">
            <span aria-hidden="true">←</span> {t("back")}
          </Link>
          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="mb-4 h-1.5 w-14 rounded-full bg-[#FFD21A]" />
              <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-5xl">
                {requestDetail?.goal || t("loading")}
              </h1>
              {requestDetail && (
                <p className="mt-3 text-sm text-white/70">
                  {t("requestNumber", {id: requestDetail.id})}
                </p>
              )}
            </div>
            {requestDetail && (
              <span className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClasses(requestDetail.status)}`}>
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
                {formatStatus(requestDetail.status)}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-10 max-w-5xl px-5 sm:px-8">
        {error && (
          <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {loading && (
          <div role="status" className="rounded-3xl border border-[#DCEDE2] bg-white p-8 text-sm text-[#52675B] shadow-sm">
            <div className="mb-4 h-2 w-14 animate-pulse rounded-full bg-[#00CFFF]" />
            {t("loading")}
          </div>
        )}

        {!loading && !error && !requestDetail && (
          <div className="rounded-3xl border border-[#DCEDE2] bg-white p-8 text-sm text-[#52675B] shadow-sm">
            {t("messages.notFound")}
          </div>
        )}

        {!loading && requestDetail && (
          <div className="space-y-6">
            <section className="grid gap-5 md:grid-cols-2">
              <article className="rounded-3xl border border-[#DCEDE2] bg-white p-6 shadow-[0_12px_35px_rgba(0,61,36,0.05)] sm:p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5F6EC] text-lg font-bold text-[#007D36]" aria-hidden="true">C</div>
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#007D36]">{t("client.title")}</h2>
                <p className="mt-3 break-words text-xl font-bold">{requestDetail.client_name}</p>
                <a href={`mailto:${requestDetail.client_email}`} className="mt-2 block break-all text-sm font-medium text-[#075C38] underline-offset-4 hover:underline">
                  {requestDetail.client_email}
                </a>
              </article>
              <article className="rounded-3xl border border-[#DCEDE2] bg-white p-6 shadow-[0_12px_35px_rgba(0,61,36,0.05)] sm:p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F9FF] text-lg font-bold text-[#075C38]" aria-hidden="true">C</div>
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#007D36]">{t("coach.title")}</h2>
                <p className="mt-3 break-words text-xl font-bold">{requestDetail.coach_name}</p>
                <a href={`mailto:${requestDetail.coach_email}`} className="mt-2 block break-all text-sm font-medium text-[#075C38] underline-offset-4 hover:underline">
                  {requestDetail.coach_email}
                </a>
              </article>
            </section>

            <section className="rounded-3xl border border-[#DCEDE2] bg-white p-6 shadow-[0_12px_35px_rgba(0,61,36,0.05)] sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span aria-hidden="true" className="h-8 w-1 rounded-full bg-[#00CFFF]" />
                <h2 className="text-lg font-bold">{t("message.title")}</h2>
              </div>
              <p className="whitespace-pre-line break-words rounded-2xl bg-[#F3FAF6] p-5 text-sm leading-8 text-[#304A3B] sm:text-base">
                {requestDetail.message || t("message.empty")}
              </p>
            </section>

            <section className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-3xl border border-[#DCEDE2] bg-white p-6 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-[0.13em] text-[#52675B]">{t("dates.requested")}</h2>
                <p className="mt-3 text-base font-semibold">{formatDate(requestDetail.created_at)}</p>
              </div>
              <div className="rounded-3xl border border-[#DCEDE2] bg-white p-6 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-[0.13em] text-[#52675B]">{t("dates.updated")}</h2>
                <p className="mt-3 text-base font-semibold">{formatDate(requestDetail.updated_at)}</p>
              </div>
            </section>

            <section className="overflow-hidden rounded-3xl border border-[#DCEDE2] bg-white shadow-[0_12px_35px_rgba(0,61,36,0.05)]">
              <div className="border-b border-[#DCEDE2] bg-[#F8FCF9] px-6 py-5 sm:px-8">
                <h2 className="text-lg font-bold">{t("actions.title")}</h2>
              </div>
              <div className="flex flex-wrap gap-3 p-6 sm:p-8">
                {requestDetail.status === "pending" && (
                  <>
                    <button type="button" onClick={() => updateStatus("accepted")} disabled={updating} className="rounded-xl bg-[#007D36] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#075C38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007D36] disabled:cursor-not-allowed disabled:opacity-60">
                      {updating ? t("actions.updating") : t("actions.accept")}
                    </button>
                    <button type="button" onClick={() => updateStatus("rejected")} disabled={updating} className="rounded-xl border border-red-200 bg-red-50 px-6 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60">
                      {updating ? t("actions.updating") : t("actions.reject")}
                    </button>
                  </>
                )}
                {requestDetail.status === "accepted" && (
                  <button type="button" onClick={() => updateStatus("completed")} disabled={updating} className="rounded-xl bg-[#FFD21A] px-6 py-3 text-sm font-bold text-[#003D24] transition hover:bg-[#F4C600] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007D36] disabled:cursor-not-allowed disabled:opacity-60">
                    {updating ? t("actions.updating") : t("actions.markCompleted")}
                  </button>
                )}
                {requestDetail.status !== "pending" && requestDetail.status !== "accepted" && (
                  <p className="text-sm text-[#52675B]">{t("actions.unavailable")}</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
