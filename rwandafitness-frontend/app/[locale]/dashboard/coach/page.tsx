"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";

import {Link, useRouter} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Stats = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  completed: number;
};

type CoachRequest = {
  id: number;
  goal: string;
  client_name: string;
  status: string;
};

type DashboardData = {
  stats: Stats;
  recent_requests: CoachRequest[];
};

const statColors = [
  {bg: "bg-[#E7F5ED]", color: "text-[#075C38]", symbol: "◈"},
  {bg: "bg-[#FFF5D6]", color: "text-[#8A6400]", symbol: "◷"},
  {bg: "bg-[#E4F8FC]", color: "text-[#007A99]", symbol: "✓"},
  {bg: "bg-[#FDEBEC]", color: "text-[#B23B4B]", symbol: "×"},
  {bg: "bg-[#EAEAFD]", color: "text-[#4E51A7]", symbol: "★"},
];

export default function CoachDashboard() {
  const t = useTranslations("CoachDashboard");
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<CoachRequest[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return () => controller.abort();
    }

    const loadDashboard = async () => {
      try {
        setError("");
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/requests/coach/dashboard/`,
          {
            headers: {Authorization: `Token ${token}`},
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const data: DashboardData = await response.json();
        if (!controller.signal.aborted) {
          setStats(data.stats);
          setRequests(data.recent_requests ?? []);
        }
      } catch (caughtError) {
        if (caughtError instanceof Error && caughtError.name === "AbortError") {
          return;
        }
        if (!controller.signal.aborted) setError(t("messages.loadFailed"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadDashboard();
    return () => controller.abort();
  }, [router, t]);

  const getStatusClasses = (status: string) => {
    if (status === "accepted") return "bg-[#E1F4E8] text-[#075C38]";
    if (status === "rejected") return "bg-rose-50 text-rose-700";
    if (status === "completed") return "bg-cyan-50 text-cyan-800";
    return "bg-amber-50 text-amber-800";
  };

  const formatStatus = (status: string) => {
    if (status === "accepted") return t("statuses.accepted");
    if (status === "rejected") return t("statuses.rejected");
    if (status === "completed") return t("statuses.completed");
    return t("statuses.pending");
  };

  const summary = stats
    ? [
        {label: t("stats.total"), value: stats.total},
        {label: t("stats.pending"), value: stats.pending},
        {label: t("stats.accepted"), value: stats.accepted},
        {label: t("stats.rejected"), value: stats.rejected},
        {label: t("stats.completed"), value: stats.completed},
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#F3FAF6] pb-16 text-[#17251E]">
      <section className="relative isolate overflow-hidden bg-[#003D24] text-white">
        <div className="pointer-events-none absolute -right-16 -top-36 h-80 w-80 rounded-full bg-[#00CFFF]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-72 rounded-full bg-[#007D36]/60 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#A8E8C4]">
            <span className="h-2 w-2 rounded-full bg-[#00CFFF]" />
            RwandaFitness · Coach
          </div>
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                {t("subtitle")}
              </p>
            </div>
            {!loading && !error && (
              <Link
                href="/my-requests"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-2xl bg-[#FFD21A] px-6 py-3 text-sm font-black text-[#003D24] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#FFE052]"
              >
                {t("actions.manageRequests")}
                <span aria-hidden="true">↗</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="relative mx-auto -mt-8 max-w-6xl px-5 sm:px-8">
        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div role="status" className="rounded-[28px] border border-[#DDECE2] bg-white p-7 shadow-sm">
            <p className="mb-5 text-sm text-[#52665B]">{t("loading")}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Array.from({length: 5}).map((_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-2xl bg-[#EDF5F0]" />
              ))}
            </div>
          </div>
        ) : stats && (
          <section aria-label={t("title")} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {summary.map((item, index) => (
              <div key={index} className="rounded-[24px] border border-[#DFECE3] bg-white p-5 shadow-[0_10px_30px_rgba(0,61,36,0.04)] transition hover:-translate-y-1 hover:shadow-lg">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-black ${statColors[index].bg} ${statColors[index].color}`} aria-hidden="true">
                  {statColors[index].symbol}
                </div>
                <p className="mt-6 text-4xl font-black tabular-nums tracking-tight text-[#003D24]">{item.value}</p>
                <p className="mt-2 text-sm font-semibold text-[#617469]">{item.label}</p>
              </div>
            ))}
          </section>
        )}

        {!loading && !error && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <section className="overflow-hidden rounded-[28px] border border-[#DFECE3] bg-white shadow-[0_12px_35px_rgba(0,61,36,0.04)]">
              <div className="border-b border-[#E9F0EB] px-6 py-6 sm:px-8">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-1.5 rounded-full bg-[#00CFFF]" />
                  <h2 className="text-xl font-black tracking-tight text-[#003D24] sm:text-2xl">{t("recent.title")}</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#6A7D70]">{t("recent.subtitle")}</p>
              </div>
              {requests.length === 0 ? (
                <div className="px-6 py-12 text-center sm:px-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EAF7EE] text-3xl text-[#075C38]" aria-hidden="true">✉</div>
                  <p className="mt-5 text-sm font-medium text-[#617469]">{t("recent.empty")}</p>
                </div>
              ) : (
                <div className="divide-y divide-[#EDF3EE]">
                  {requests.map((request) => (
                    <div key={request.id} className="flex flex-col gap-4 px-6 py-5 transition hover:bg-[#FAFDFB] sm:flex-row sm:items-center sm:justify-between sm:px-8">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF7EE] font-black text-[#075C38]" aria-hidden="true">✦</div>
                        <div className="min-w-0">
                          <p className="break-words font-bold text-[#17251E]">{request.goal}</p>
                          <p className="mt-1 text-sm text-[#6A7D70]">{t("recent.client", {name: request.client_name})}</p>
                        </div>
                      </div>
                      <span className={`inline-flex w-fit shrink-0 items-center rounded-full px-3.5 py-1.5 text-xs font-bold ${getStatusClasses(request.status)}`}>
                        {formatStatus(request.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-[#EDF3EE] bg-[#FCFEFC] px-6 py-5 sm:px-8">
                <Link href="/my-requests" className="inline-flex items-center gap-2 text-sm font-black text-[#075C38] transition hover:gap-3">
                  {t("actions.manageRequests")} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </section>

            <aside className="rounded-[28px] bg-[#075C38] p-6 text-white shadow-[0_14px_40px_rgba(0,61,36,0.14)] sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl" aria-hidden="true">✎</div>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#A8E8C4]">RwandaFitness</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">{t("actions.editProfile")}</h2>
              <div className="mt-6 h-px bg-white/20" />
              <Link href="/coaches/profile" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#075C38] transition hover:bg-[#EAF7EE]">
                {t("actions.editProfile")} <span aria-hidden="true">↗</span>
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
