"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";

import StatCard from "@/components/StatCard";
import {Link, useRouter} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Stats = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  completed: number;
};

type Request = {
  id: number;
  goal: string;
  client_name: string;
  status: string;
};

type DashboardData = {
  stats: Stats;
  recent_requests: Request[];
};

export default function CoachDashboard() {
  const t = useTranslations("CoachDashboard");
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

      return () => {
        controller.abort();
      };
    }

    const loadDashboard = async () => {
      try {
        setError("");
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/requests/coach/dashboard/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
            signal: controller.signal,
            cache: "no-store",
          }
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

        setStats(data.stats);
        setRequests(data.recent_requests ?? []);
      } catch (caughtError) {
        if (
          caughtError instanceof Error &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError(t("messages.loadFailed"));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      controller.abort();
    };
  }, [router, t]);

  const getStatusClasses = (status: string) => {
    if (status === "accepted") {
      return "bg-green-100 text-green-700";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (status === "completed") {
      return "bg-blue-100 text-blue-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  const formatStatus = (status: string) => {
    if (status === "accepted") {
      return t("statuses.accepted");
    }

    if (status === "rejected") {
      return t("statuses.rejected");
    }

    if (status === "completed") {
      return t("statuses.completed");
    }

    return t("statuses.pending");
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold text-zinc-900">
        {t("title")}
      </h1>

      <p className="mt-2 text-sm text-zinc-500">
        {t("subtitle")}
      </p>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("loading")}
        </div>
      )}

      {!loading && stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
          <StatCard
            label={t("stats.total")}
            value={stats.total}
          />

          <StatCard
            label={t("stats.pending")}
            value={stats.pending}
          />

          <StatCard
            label={t("stats.accepted")}
            value={stats.accepted}
          />

          <StatCard
            label={t("stats.rejected")}
            value={stats.rejected}
          />

          <StatCard
            label={t("stats.completed")}
            value={stats.completed}
          />
        </div>
      )}

      {!loading && !error && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/my-requests"
            className="inline-flex items-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {t("actions.manageRequests")}
          </Link>

          <Link
            href="/coaches/profile"
            className="inline-flex items-center rounded-xl border border-primary px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            {t("actions.editProfile")}
          </Link>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-900">
            {t("recent.title")}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {t("recent.subtitle")}
          </p>

          {requests.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm">
              {t("recent.empty")}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900">
                      {request.goal}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {t("recent.client", {
                        name: request.client_name,
                      })}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                      request.status
                    )}`}
                  >
                    {formatStatus(request.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}