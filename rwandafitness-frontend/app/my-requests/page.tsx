"use client";

import { useEffect, useState } from "react";

type Request = {
  id: number;
  client_name: string;
  coach_name: string;
  goal: string;
  message: string;
  status: string;
  created_at: string;
};

type User = {
  full_name: string;
  role: string;
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const [userRes, reqRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/auth/me/", {
          headers: { Authorization: `Token ${token}` },
        }),
        fetch("http://127.0.0.1:8000/api/requests/", {
          headers: { Authorization: `Token ${token}` },
        }),
      ]);

      if (!userRes.ok || !reqRes.ok) {
        throw new Error("Failed to load data.");
      }

      const userData = await userRes.json();
      const reqData = await reqRes.json();

      setUser(userData);
      setRequests(Array.isArray(reqData) ? reqData : reqData.results ?? []);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in.");
      return;
    }

    try {
      setUpdatingId(id);

      const res = await fetch(`http://127.0.0.1:8000/api/requests/${id}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("Failed to update request.");
      }

      await fetchData();
    } catch {
      setError("Failed to update request.");
    } finally {
      setUpdatingId(null);
    }
  };

  const pageTitle =
    user?.role === "coach" ? "Requests from Clients" : "My Coaching Requests";

  const getStatusClasses = (status: string) => {
    if (status === "accepted") {
      return "bg-green-100 text-green-700";
    }
    if (status === "rejected") {
      return "bg-red-100 text-red-700";
    }
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {pageTitle}
        </h1>

        {user && (
          <p className="mt-2 text-sm text-zinc-500">
            Logged in as <span className="font-medium">{user.full_name}</span> ({user.role})
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          Loading requests...
        </div>
      )}

      {!loading && !error && requests.length === 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          No requests yet.
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">{req.goal}</h2>

                  <p className="mt-2 text-sm text-zinc-600">
                    {user?.role === "coach" ? (
                      <>
                        <span className="font-medium text-zinc-900">Client:</span>{" "}
                        {req.client_name}
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-zinc-900">Coach:</span>{" "}
                        {req.coach_name}
                      </>
                    )}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    req.status
                  )}`}
                >
                  {req.status}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                <p className="text-sm leading-7 text-zinc-700">{req.message}</p>
              </div>

              {user?.role === "coach" && req.status === "pending" && (
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => updateStatus(req.id, "accepted")}
                    disabled={updatingId === req.id}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70"
                  >
                    {updatingId === req.id ? "Updating..." : "Accept"}
                  </button>

                  <button
                    onClick={() => updateStatus(req.id, "rejected")}
                    disabled={updatingId === req.id}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
                  >
                    {updatingId === req.id ? "Updating..." : "Reject"}
                  </button>
                </div>
              )}

              <p className="mt-5 text-xs text-zinc-500">
                {new Date(req.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}