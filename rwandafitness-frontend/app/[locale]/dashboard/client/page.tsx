"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";

import {Link, useRouter} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Stats = {total: number; pending: number; accepted: number; rejected: number};
type Request = {id: number; goal: string; status: string};
type RequestsResponse = Request[] | {results?: Request[]};

const statIcons = [
  <svg key="all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>,
  <svg key="pending" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  <svg key="accepted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>,
  <svg key="rejected" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/></svg>,
];

export default function ClientDashboard() {
  const t = useTranslations("ClientDashboard");
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return () => controller.abort();
    }

    async function loadDashboard() {
      try {
        setError("");
        setLoading(true);
        const headers = {Authorization: `Token ${token}`};
        const [statsResponse, requestsResponse] = await Promise.all([
          fetch(`${API_URL}/api/requests/stats/`, {headers, signal: controller.signal, cache: "no-store"}),
          fetch(`${API_URL}/api/requests/`, {headers, signal: controller.signal, cache: "no-store"}),
        ]);
        if ([statsResponse.status, requestsResponse.status].some((status) => status === 401 || status === 403)) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          router.replace("/login");
          return;
        }
        if (!statsResponse.ok || !requestsResponse.ok) throw new Error("Failed to load dashboard data");
        const statsData: Stats = await statsResponse.json();
        const requestsData: RequestsResponse = await requestsResponse.json();
        if (controller.signal.aborted) return;
        const normalizedRequests = Array.isArray(requestsData) ? requestsData : requestsData.results ?? [];
        setStats(statsData);
        setRequests(normalizedRequests.slice(0, 3));
      } catch (caughtError) {
        if (caughtError instanceof Error && caughtError.name === "AbortError") return;
        if (!controller.signal.aborted) setError(t("messages.loadFailed"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadDashboard();
    return () => controller.abort();
  }, [router, t]);

  const getStatusClasses = (status: string) => {
    if (status === "accepted") return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    if (status === "rejected") return "bg-rose-50 text-rose-700 ring-rose-200";
    if (status === "completed") return "bg-sky-50 text-sky-700 ring-sky-200";
    return "bg-amber-50 text-amber-800 ring-amber-200";
  };

  const formatStatus = (status: string) => {
    if (status === "accepted") return t("statuses.accepted");
    if (status === "rejected") return t("statuses.rejected");
    if (status === "completed") return t("statuses.completed");
    return t("statuses.pending");
  };

  const summary = stats ? [
    {label: t("stats.total"), value: stats.total, color: "text-[#075C38]", surface: "bg-emerald-50"},
    {label: t("stats.pending"), value: stats.pending, color: "text-amber-700", surface: "bg-amber-50"},
    {label: t("stats.accepted"), value: stats.accepted, color: "text-emerald-700", surface: "bg-emerald-50"},
    {label: t("stats.rejected"), value: stats.rejected, color: "text-rose-700", surface: "bg-rose-50"},
  ] : [];

  return (
    <main className="min-h-screen bg-[#F3FAF6] pb-20 text-[#17251E]">
      <section className="relative isolate overflow-hidden bg-[#003D24] text-white">
        <div className="pointer-events-none absolute -right-28 -top-40 h-[420px] w-[420px] rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -right-12 -top-24 h-[320px] w-[320px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#00CFFF]/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#FFD21A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFD21A]" /> RwandaFitness
          </div>
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{t("title")}</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/75 sm:text-lg">{t("subtitle")}</p>
            </div>
            {!loading && !error && (
              <Link href="/coaches" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-2xl bg-[#FFD21A] px-6 py-3 text-sm font-extrabold text-[#003D24] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#ffe05c] md:self-auto">
                {t("actions.findCoach")} <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {error && <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">{error}</div>}

        {loading ? (
          <div className="py-9" role="status" aria-live="polite">
            <p className="mb-5 text-sm font-medium text-[#075C38]">{t("loading")}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({length: 4}).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-3xl bg-white shadow-sm" />)}
            </div>
            <div className="mt-8 h-64 animate-pulse rounded-3xl bg-white shadow-sm" />
          </div>
        ) : !error && (
          <>
            {stats && (
              <section aria-label={t("title")} className="relative -mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {summary.map((item, index) => (
                  <div key={index} className="group rounded-[26px] border border-[#E1EDE5] bg-white p-5 shadow-[0_12px_35px_rgba(0,61,36,0.05)] transition hover:-translate-y-1 hover:shadow-lg sm:p-6">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.surface} ${item.color}`}>
                      <div className="h-6 w-6">{statIcons[index]}</div>
                    </div>
                    <p className="mt-5 text-4xl font-black tracking-tight text-[#003D24] tabular-nums">{item.value}</p>
                    <p className="mt-2 text-sm font-semibold text-[#617568]">{item.label}</p>
                  </div>
                ))}
              </section>
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
              <section className="overflow-hidden rounded-[28px] border border-[#E1EDE5] bg-white shadow-[0_12px_35px_rgba(0,61,36,0.04)]">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E9F0EB] p-6 sm:p-8">
                  <div>
                    <div className="mb-3 h-1 w-10 rounded-full bg-[#FFD21A]" />
                    <h2 className="text-2xl font-black tracking-tight text-[#003D24]">{t("recent.title")}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#617568]">{t("recent.subtitle")}</p>
                  </div>
                  <Link href="/my-requests" className="inline-flex items-center gap-2 rounded-full border border-[#D8E8DC] px-4 py-2 text-sm font-bold text-[#075C38] transition hover:bg-[#F3FAF6]">
                    {t("actions.viewAllRequests")} <span aria-hidden="true">↗</span>
                  </Link>
                </div>
                {requests.length === 0 ? (
                  <div className="px-6 py-14 text-center sm:px-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F3FAF6] text-3xl text-[#075C38]" aria-hidden="true">✦</div>
                    <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#617568]">{t("recent.empty")}</p>
                    <Link href="/coaches" className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#075C38] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#003D24]">{t("actions.findCoach")}</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E9F0EB]">
                    {requests.map((request) => (
                      <div key={request.id} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-[#FAFDFB] sm:flex-row sm:items-center sm:justify-between sm:px-8">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3FAF6] font-black text-[#075C38]" aria-hidden="true">↗</div>
                          <p className="min-w-0 break-words font-bold text-[#17251E]">{request.goal}</p>
                        </div>
                        <span className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold ring-1 ring-inset ${getStatusClasses(request.status)}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />{formatStatus(request.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <aside className="rounded-[28px] bg-[#003D24] p-6 text-white shadow-[0_12px_35px_rgba(0,61,36,0.12)] sm:p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-2xl text-[#FFD21A]" aria-hidden="true">✦</div>
                <h2 className="text-xl font-black tracking-tight">{t("actions.findCoach")}</h2>
                <p className="mt-3 text-sm leading-7 text-white/70">{t("subtitle")}</p>
                <Link href="/coaches" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD21A] px-5 py-3.5 text-sm font-extrabold text-[#003D24] transition hover:bg-[#ffe05c]">{t("actions.findCoach")} <span aria-hidden="true">↗</span></Link>
                <Link href="/my-requests" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">{t("actions.viewAllRequests")}</Link>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
