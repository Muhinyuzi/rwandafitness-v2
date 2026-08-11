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

  const [requestDetail, setRequestDetail] =
    useState<RequestDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    window.dispatchEvent(new Event("auth-changed"));

    router.replace("/login");
  }, [router]);

  const loadRequest = useCallback(
    async (signal?: AbortSignal) => {
      const token = localStorage.getItem("token");

      if (!token) {
        handleAuthError();
        return;
      }

      try {
        setError("");

        const response = await fetch(
          `${API_URL}/api/requests/${id}/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
            signal,
            cache: "no-store",
          }
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          handleAuthError();
          return;
        }

        if (response.status === 404) {
          setRequestDetail(null);
          setError(t("messages.notFound"));
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load request");
        }

        const data: RequestDetail = await response.json();

        setRequestDetail(data);
      } catch (caughtError) {
        if (
          caughtError instanceof Error &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError(t("messages.loadFailed"));
      }
    },
    [handleAuthError, id, t]
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadPage = async () => {
      setLoading(true);

      try {
        await loadRequest(controller.signal);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      void loadPage();
    }

    return () => {
      controller.abort();
    };
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

      const response = await fetch(
        `${API_URL}/api/requests/${id}/status/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update request");
      }

      await loadRequest();
    } catch {
      setError(t("messages.updateFailed"));
    } finally {
      setUpdating(false);
    }
  };

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

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return t("invalidDate");
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsedDate);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/my-requests"
          className="text-sm font-medium text-primary hover:underline"
        >
          ← {t("back")}
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("loading")}
        </div>
      )}

      {!loading && !error && !requestDetail && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("messages.notFound")}
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
                {t("requestNumber", {
                  id: requestDetail.id,
                })}
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
              <h2 className="text-sm font-semibold text-zinc-900">
                {t("client.title")}
              </h2>

              <p className="mt-2 text-sm text-zinc-700">
                {requestDetail.client_name}
              </p>

              <a
                href={`mailto:${requestDetail.client_email}`}
                className="mt-1 block break-all text-sm text-primary hover:underline"
              >
                {requestDetail.client_email}
              </a>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-5">
              <h2 className="text-sm font-semibold text-zinc-900">
                {t("coach.title")}
              </h2>

              <p className="mt-2 text-sm text-zinc-700">
                {requestDetail.coach_name}
              </p>

              <a
                href={`mailto:${requestDetail.coach_email}`}
                className="mt-1 block break-all text-sm text-primary hover:underline"
              >
                {requestDetail.coach_email}
              </a>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-zinc-50 p-5">
            <h2 className="text-sm font-semibold text-zinc-900">
              {t("message.title")}
            </h2>

            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-700">
              {requestDetail.message || t("message.empty")}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-900">
                {t("dates.requested")}
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                {formatDate(requestDetail.created_at)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-5">
              <h2 className="text-sm font-semibold text-zinc-900">
                {t("dates.updated")}
              </h2>

              <p className="mt-2 text-sm text-zinc-600">
                {formatDate(requestDetail.updated_at)}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-200 pt-6">
            <h2 className="text-sm font-semibold text-zinc-900">
              {t("actions.title")}
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">
              {requestDetail.status === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() => updateStatus("accepted")}
                    disabled={updating}
                    className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {updating
                      ? t("actions.updating")
                      : t("actions.accept")}
                  </button>

                  <button
                    type="button"
                    onClick={() => updateStatus("rejected")}
                    disabled={updating}
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {updating
                      ? t("actions.updating")
                      : t("actions.reject")}
                  </button>
                </>
              )}

              {requestDetail.status === "accepted" && (
                <button
                  type="button"
                  onClick={() => updateStatus("completed")}
                  disabled={updating}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {updating
                    ? t("actions.updating")
                    : t("actions.markCompleted")}
                </button>
              )}

              {requestDetail.status !== "pending" &&
                requestDetail.status !== "accepted" && (
                  <p className="text-sm text-zinc-500">
                    {t("actions.unavailable")}
                  </p>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}