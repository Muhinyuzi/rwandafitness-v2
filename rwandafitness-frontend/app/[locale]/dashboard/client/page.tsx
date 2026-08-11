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
};

type Request = {
  id: number;
  goal: string;
  status: string;
};

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

      return () => {
        controller.abort();
      };
    }

    const loadDashboard = async () => {
      try {
        setError("");
        setLoading(true);

        const [statsResponse, requestsResponse] = await Promise.all([
          fetch(`${API_URL}/api/requests/stats/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/requests/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);

        if (
          statsResponse.status === 401 ||
          statsResponse.status === 403 ||
          requestsResponse.status === 401 ||
          requestsResponse.status === 403
        ) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");

          router.replace("/login");
          return;
        }

        if (!statsResponse.ok || !requestsResponse.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const statsData: Stats = await statsResponse.json();
        const requestsData = await requestsResponse.json();

        const normalizedRequests: Request[] = Array.isArray(requestsData)
          ? requestsData
          : requestsData.results ?? [];

        setStats(statsData);
        setRequests(normalizedRequests.slice(0, 3));
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
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
        </div>
      )}

      {!loading && !error && (
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/coaches"
            className="inline-flex items-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {t("actions.findCoach")}
          </Link>

          <Link
            href="/my-requests"
            className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            {t("actions.viewAllRequests")}
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
                  <p className="font-semibold text-zinc-900">
                    {request.goal}
                  </p>

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