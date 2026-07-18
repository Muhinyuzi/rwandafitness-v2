"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/api";

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
  const params = useParams();
  const id = params.id as string;

  const [requestDetail, setRequestDetail] = useState<RequestDetail | null>(
    null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const handleAuthError = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const loadRequest = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setError("");

      const res = await fetch(`${API_URL}/api/requests/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (res.status === 401) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load request.");
      }

      const data = await res.json();
      setRequestDetail(data);
    } catch {
      setError("Failed to load request.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [id]);

  const updateStatus = async (status: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      handleAuthError();
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const res = await fetch(`${API_URL}/api/requests/${id}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.status === 401) {
        handleAuthError();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to update request.");
      }

      await loadRequest();
    } catch {
      setError("Failed to update request.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusClasses = (status: string) => {
    if (status === "accepted") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    if (status === "completed") return "bg-blue-100 text-blue-700";

    return "bg-amber-100 text-amber-700";
  };

  const formatStatus = (status: string) => {
    if (status === "accepted") return "Accepted";
    if (status === "rejected") return "Rejected";
    if (status === "completed") return "Completed";

    return "Pending";
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/my-requests"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to requests
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          Loading request...
        </div>
      )}

      {!loading && requestDetail && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-4 h-1.5 w-16 rounded-full bg-primary" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                {requestDetail.goal}
              </h1>

              <p className="mt-2 text-sm text-zinc-500">
                Request #{requestDetail.id}
              </p>
            </div>

            <span
              className={`inline-flex w-fit rounded-full px-4 py-1 text-sm font-semibold ${getStatusClasses(
                requestDetail.status
              )}`}
            >
              {formatStatus(requestDetail.status)}
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-zinc-50 p-5">
              <h2 className="text-sm font-semibold text-zinc-900">Client</h2>
              <p className="mt-2 text-sm text-zinc-700">
                {requestDetail.client_name}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {requestDetail.client_email}
              </p>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-5">
              <h2 className="text-sm font-semibold text-zinc-900">Coach</h2>
              <p className="mt-2 text-sm text-zinc-700">
                {requestDetail.coach_name}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {requestDetail.coach_email}
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-zinc-50 p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Message</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">
              {requestDetail.message || "No message provided."}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-900">
                Requested
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                {new Date(requestDetail.created_at).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-900">
                Last updated
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                {new Date(requestDetail.updated_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-200 pt-6">
            <h2 className="text-sm font-semibold text-zinc-900">
              Actions
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {requestDetail.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => updateStatus("accepted")}
                    disabled={updating}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70"
                  >
                    {updating ? "Updating..." : "Accept"}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStatus("rejected")}
                    disabled={updating}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
                  >
                    {updating ? "Updating..." : "Reject"}
                  </button>
                </>
              )}

              {requestDetail.status === "accepted" && (
                <button
                  type="button"
                  onClick={() => updateStatus("completed")}
                  disabled={updating}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                >
                  {updating ? "Updating..." : "Mark as Completed"}
                </button>
              )}

              {requestDetail.status !== "pending" &&
                requestDetail.status !== "accepted" && (
                  <p className="text-sm text-zinc-500">
                    No actions available for this request.
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}