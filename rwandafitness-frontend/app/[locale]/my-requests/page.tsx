"use client";

import {useCallback, useEffect, useState} from "react";
import {useLocale, useTranslations} from "next-intl";

import {useRouter} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type CoachingRequest = {
  id: number;
  client_name: string;
  coach_name: string;
  goal: string;
  message: string;
  status: string;
  created_at: string;
  has_review: boolean;
  review_id: number | null;
};

type User = {
  full_name: string;
  role: string;
};

type RequestsApiResponse =
  | CoachingRequest[]
  | {results?: CoachingRequest[]};

export default function MyRequestsPage() {
  const t = useTranslations("MyRequests");
  const locale = useLocale();
  const router = useRouter();

  const [requests, setRequests] = useState<CoachingRequest[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-changed"));
    router.replace("/login");
  }, [router]);

  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      const token = localStorage.getItem("token");

      if (!token) {
        handleAuthError();
        return;
      }

      try {
        setError("");

        const [userResponse, requestsResponse] = await Promise.all([
          fetch(`${API_URL}/api/auth/me/`, {
            headers: {Authorization: `Token ${token}`},
            signal,
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/requests/`, {
            headers: {Authorization: `Token ${token}`},
            signal,
            cache: "no-store",
          }),
        ]);

        if (
          userResponse.status === 401 ||
          userResponse.status === 403 ||
          requestsResponse.status === 401 ||
          requestsResponse.status === 403
        ) {
          handleAuthError();
          return;
        }

        if (!userResponse.ok || !requestsResponse.ok) {
          throw new Error("Failed to load data");
        }

        const userData: User = await userResponse.json();
        const requestsData: RequestsApiResponse =
          await requestsResponse.json();

        const requestList = Array.isArray(requestsData)
          ? requestsData
          : Array.isArray(requestsData.results)
            ? requestsData.results
            : [];

        if (signal?.aborted) return;
        setUser(userData);
        setRequests(requestList);
      } catch (caughtError) {
        if (
          (caughtError instanceof Error && caughtError.name === "AbortError") ||
          signal?.aborted
        ) {
          return;
        }
        setError(t("messages.loadFailed"));
      }
    },
    [handleAuthError, t]
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadPage = async () => {
      setLoading(true);
      try {
        await fetchData(controller.signal);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadPage();
    return () => controller.abort();
  }, [fetchData]);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleAuthError();
      return;
    }

    try {
      setUpdatingId(id);
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
      await fetchData();
    } catch {
      setError(t("messages.updateFailed"));
    } finally {
      setUpdatingId(null);
    }
  };

  const pageTitle = user?.role === "coach" ? t("titles.coach") : t("titles.client");

  const getRoleLabel = (role: string) => {
    if (role === "coach") return t("roles.coach");
    if (role === "client") return t("roles.client");
    if (role === "admin") return t("roles.admin");
    return role;
  };

  const getStatusClasses = (status: string) => {
    if (status === "accepted") return "border-emerald-200 bg-emerald-50 text-emerald-800";
    if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
    if (status === "completed") return "border-cyan-200 bg-cyan-50 text-cyan-900";
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
    if (Number.isNaN(parsedDate.getTime())) return "";
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsedDate);
  };

  return (
    <main className="min-h-screen bg-[#F3FAF6] pb-20 text-[#17251E]">
      <section className="relative isolate overflow-hidden bg-[#003D24] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border border-[#00CFFF]/30" />
        <div aria-hidden="true" className="pointer-events-none absolute right-10 top-0 h-72 w-72 rounded-full bg-[#00CFFF]/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#007D36]/50 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FFD21A]">
            <span className="h-2 w-2 rounded-full bg-[#00CFFF]" />
            RwandaFitness
          </div>
          <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {pageTitle}
          </h1>
          {user && (
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              {t.rich("loggedInAs", {
                name: user.full_name,
                role: getRoleLabel(user.role),
                strong: (chunks) => <strong className="font-bold text-white">{chunks}</strong>,
              })}
            </p>
          )}
          {!loading && !error && (
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-sm">
              <span className="text-3xl font-black text-[#FFD21A]">{requests.length}</span>
              <span className="text-sm font-semibold text-white/80">{pageTitle}</span>
            </div>
          )}
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-[#007D36] via-[#00CFFF] to-[#FFD21A]" />
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-12">
        {error && (
          <div role="alert" className="mb-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div role="status" className="space-y-5" aria-live="polite">
            <p className="text-sm font-medium text-[#52675B]">{t("loading")}</p>
            {[0, 1, 2].map((index) => (
              <div key={index} className="animate-pulse rounded-[28px] border border-[#DCEDE2] bg-white p-6 shadow-sm sm:p-8">
                <div className="h-6 w-2/3 rounded-lg bg-[#E4F1E8]" />
                <div className="mt-5 h-4 w-1/3 rounded-lg bg-[#EAF5EE]" />
                <div className="mt-6 h-20 rounded-xl bg-[#F3FAF6]" />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="rounded-[30px] border border-[#DCEDE2] bg-white px-6 py-16 text-center shadow-[0_12px_40px_rgba(0,61,36,0.05)] sm:px-12">
            <div aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5F6EC] text-3xl text-[#007D36]">✦</div>
            <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-[#52675B]">{t("empty")}</p>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <div className="space-y-5">
            {requests.map((request) => (
              <article key={request.id} className="overflow-hidden rounded-[28px] border border-[#DCEDE2] bg-white shadow-[0_12px_40px_rgba(0,61,36,0.055)] transition-shadow hover:shadow-[0_18px_50px_rgba(0,61,36,0.1)]">
                <div className="flex flex-col gap-5 p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 h-1 w-12 rounded-full bg-[#00CFFF]" />
                      <h2 className="break-words text-xl font-black tracking-tight text-[#003D24] sm:text-2xl">{request.goal}</h2>
                      <p className="mt-3 text-sm text-[#52675B]">
                        {user?.role === "coach" ? (
                          <><span className="font-bold text-[#17251E]">{t("labels.client")}:</span>{" "}{request.client_name}</>
                        ) : (
                          <><span className="font-bold text-[#17251E]">{t("labels.coach")}:</span>{" "}{request.coach_name}</>
                        )}
                      </p>
                    </div>
                    <span className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${getStatusClasses(request.status)}`}>
                      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
                      {formatStatus(request.status)}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-[#E3F0E8] bg-[#F3FAF6] px-5 py-4">
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[#304A3B]">{request.message || t("noMessage")}</p>
                  </div>

                  {user?.role === "coach" && request.status === "pending" && (
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={() => updateStatus(request.id, "accepted")} disabled={updatingId === request.id} className="rounded-xl bg-[#007D36] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#075C38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007D36] disabled:cursor-not-allowed disabled:opacity-60">
                        {updatingId === request.id ? t("actions.updating") : t("actions.accept")}
                      </button>
                      <button type="button" onClick={() => updateStatus(request.id, "rejected")} disabled={updatingId === request.id} className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60">
                        {updatingId === request.id ? t("actions.updating") : t("actions.reject")}
                      </button>
                    </div>
                  )}

                  {user?.role === "coach" && request.status === "accepted" && (
                    <div>
                      <button type="button" onClick={() => updateStatus(request.id, "completed")} disabled={updatingId === request.id} className="rounded-xl bg-[#003D24] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#075C38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007D36] disabled:cursor-not-allowed disabled:opacity-60">
                        {updatingId === request.id ? t("actions.updating") : t("actions.markCompleted")}
                      </button>
                    </div>
                  )}

                  {user?.role === "client" && request.status === "completed" && !request.has_review && (
                    <div>
                      <button type="button" onClick={() => router.push(`/my-requests/${request.id}/review`)} className="rounded-xl bg-[#FFD21A] px-5 py-3 text-sm font-black text-[#003D24] transition hover:bg-[#F4C400] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007D36]">
                        {t("actions.leaveReview")}
                      </button>
                    </div>
                  )}

                  {user?.role === "client" && request.status === "completed" && request.has_review && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                      <p className="text-sm font-semibold text-emerald-800">✓ {t("actions.reviewSubmitted")}</p>
                    </div>
                  )}
                </div>
                <div className="border-t border-[#E3F0E8] bg-[#FBFDFB] px-6 py-4 sm:px-8">
                  <time dateTime={request.created_at} className="text-xs font-medium text-[#617668]">{formatDate(request.created_at)}</time>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
