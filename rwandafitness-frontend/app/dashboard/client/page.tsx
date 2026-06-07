"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "../../../components/StatCard";

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
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    const loadDashboard = async () => {
      try {
        setError("");

        const [statsRes, requestsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/requests/stats/", {
            headers: { Authorization: `Token ${token}` },
          }),
          fetch("http://127.0.0.1:8000/api/requests/", {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);

        if (statsRes.status === 401 || requestsRes.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        if (!statsRes.ok || !requestsRes.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        const statsData = await statsRes.json();
        const requestsData = await requestsRes.json();

        setStats(statsData);

        const normalizedRequests = Array.isArray(requestsData)
          ? requestsData
          : requestsData.results ?? [];

        setRequests(normalizedRequests.slice(0, 3));
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getStatusClasses = (status: string) => {
    if (status === "accepted") {
      return "bg-green-100 text-green-700";
    }
    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }
    return "bg-amber-100 text-amber-700";
  };

  const formatStatus = (status: string) => {
    if (status === "accepted") return "Accepted";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold text-zinc-900">Client Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Track your coaching requests and continue your fitness journey.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          Loading dashboard...
        </div>
      )}

      {!loading && stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <StatCard label="Total Requests" value={stats.total} />
          <StatCard label="Pending" value={stats.pending} />
          <StatCard label="Accepted" value={stats.accepted} />
          <StatCard label="Rejected" value={stats.rejected} />
        </div>
      )}

      {!loading && !error && (
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/coaches"
            className="inline-flex items-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Find Coach
          </Link>

          <Link
            href="/my-requests"
            className="inline-flex items-center rounded-xl border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            View All Requests
          </Link>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-900">
            Recent Requests
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Your latest coaching activity
          </p>

          {requests.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm">
              No requests yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <p className="font-semibold text-zinc-900">{r.goal}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                      r.status
                    )}`}
                  >
                    {formatStatus(r.status)}
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