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
  | {
      results?: CoachingRequest[];
    };

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
            headers: {
              Authorization: `Token ${token}`,
            },
            signal,
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/requests/`, {
            headers: {
              Authorization: `Token ${token}`,
            },
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

        setUser(userData);
        setRequests(requestList);
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
    [handleAuthError, t]
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadPage = async () => {
      setLoading(true);

      try {
        await fetchData(controller.signal);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadPage();

    return () => {
      controller.abort();
    };
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

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to update request");
      }

      await fetchData();
    } catch {
      setError(t("messages.updateFailed"));
    } finally {
      setUpdatingId(null);
    }
  };

  const pageTitle =
    user?.role === "coach"
      ? t("titles.coach")
      : t("titles.client");

  const getRoleLabel = (role: string) => {
    if (role === "coach") {
      return t("roles.coach");
    }

    if (role === "client") {
      return t("roles.client");
    }

    if (role === "admin") {
      return t("roles.admin");
    }

    return role;
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
      return "";
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsedDate);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          {pageTitle}
        </h1>

        {user && (
          <p className="mt-2 text-sm text-zinc-500">
            {t.rich("loggedInAs", {
              name: user.full_name,
              role: getRoleLabel(user.role),
              strong: (chunks) => (
                <span className="font-medium text-zinc-900">
                  {chunks}
                </span>
              ),
            })}
          </p>
        )}
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

      {!loading && !error && requests.length === 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("empty")}
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">
                    {request.goal}
                  </h2>

                  <p className="mt-2 text-sm text-zinc-600">
                    {user?.role === "coach" ? (
                      <>
                        <span className="font-medium text-zinc-900">
                          {t("labels.client")}:
                        </span>{" "}
                        {request.client_name}
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-zinc-900">
                          {t("labels.coach")}:
                        </span>{" "}
                        {request.coach_name}
                      </>
                    )}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    request.status
                  )}`}
                >
                  {formatStatus(request.status)}
                </span>
              </div>

              <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                <p className="text-sm leading-7 text-zinc-700">
                  {request.message || t("noMessage")}
                </p>
              </div>

              {user?.role === "coach" &&
                request.status === "pending" && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(request.id, "accepted")
                      }
                      disabled={updatingId === request.id}
                      className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {updatingId === request.id
                        ? t("actions.updating")
                        : t("actions.accept")}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(request.id, "rejected")
                      }
                      disabled={updatingId === request.id}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {updatingId === request.id
                        ? t("actions.updating")
                        : t("actions.reject")}
                    </button>
                  </div>
                )}

              {user?.role === "coach" &&
                request.status === "accepted" && (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(request.id, "completed")
                      }
                      disabled={updatingId === request.id}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {updatingId === request.id
                        ? t("actions.updating")
                        : t("actions.markCompleted")}
                    </button>
                  </div>
                )}

              {user?.role === "client" &&
                request.status === "completed" &&
                !request.has_review && (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/my-requests/${request.id}/review`
                        )
                      }
                      className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      {t("actions.leaveReview")}
                    </button>
                  </div>
                )}

              {user?.role === "client" &&
                request.status === "completed" &&
                request.has_review && (
                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <p className="text-sm font-medium text-green-700">
                      {t("actions.reviewSubmitted")}
                    </p>
                  </div>
                )}

              <p className="mt-5 text-xs text-zinc-500">
                {formatDate(request.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}