"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

import {
  Link,
  useRouter,
} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Notification = {
  id: number;
  notification_type:
    | "coaching_request"
    | "request_accepted"
    | "request_rejected"
    | "request_completed"
    | "review"
    | "system";
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
};

type PaginatedNotifications = {
  results: Notification[];
};

function isPaginatedNotifications(
  data: unknown,
): data is PaginatedNotifications {
  if (
    !data ||
    typeof data !== "object"
  ) {
    return false;
  }

  const value =
    data as Record<
      string,
      unknown
    >;

  return Array.isArray(
    value.results,
  );
}

export default function NotificationsPage() {
  const locale = useLocale();
  const t =
    useTranslations(
      "NotificationsPage",
    );

  const router =
    useRouter();

  const [
    notifications,
    setNotifications,
  ] = useState<
    Notification[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token",
      );

    if (!token) {
      router.replace(
        "/login",
      );

      return;
    }

    const controller =
      new AbortController();

    const loadNotifications =
      async () => {
        try {
          setLoading(true);
          setErrorMessage("");

          const response =
            await fetch(
              `${API_URL}/api/notifications/`,
              {
                headers: {
                  Authorization:
                    `Token ${token}`,
                },
                signal:
                  controller.signal,
                cache:
                  "no-store",
              },
            );

          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            localStorage.removeItem(
              "token",
            );

            sessionStorage.removeItem(
              "token",
            );

            router.replace(
              "/login",
            );

            return;
          }

          if (!response.ok) {
            throw new Error(
              "Unable to load notifications.",
            );
          }

          const data: unknown =
            await response.json();

          if (
            controller.signal
              .aborted
          ) {
            return;
          }

          if (
            Array.isArray(data)
          ) {
            setNotifications(
              data as Notification[],
            );

            return;
          }

          if (
            isPaginatedNotifications(
              data,
            )
          ) {
            setNotifications(
              data.results,
            );

            return;
          }

          setNotifications(
            [],
          );
        } catch (error) {
          if (
            error instanceof
              Error &&
            error.name ===
              "AbortError"
          ) {
            return;
          }

          setNotifications(
            [],
          );

          setErrorMessage(
            t(
              "messages.loadFailed",
            ),
          );
        } finally {
          if (
            !controller.signal
              .aborted
          ) {
            setLoading(
              false,
            );
          }
        }
      };

    void loadNotifications();

    return () => {
      controller.abort();
    };
  }, [router, t]);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (
    value: string,
  ) => {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "";
    }

    return new Intl.DateTimeFormat(
      locale,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    ).format(date);
  };

  // =========================================================
  // MARK ONE AS READ
  // =========================================================

  const markAsRead =
    async (
      notification:
        Notification,
    ) => {
      if (
        notification.is_read
      ) {
        return true;
      }

      const token =
        localStorage.getItem(
          "token",
        );

      if (!token) {
        router.replace(
          "/login",
        );

        return false;
      }

      try {
        const response =
          await fetch(
            `${API_URL}/api/notifications/${notification.id}/read/`,
            {
              method:
                "POST",
              headers: {
                Authorization:
                  `Token ${token}`,
              },
            },
          );

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          localStorage.removeItem(
            "token",
          );

          sessionStorage.removeItem(
            "token",
          );

          router.replace(
            "/login",
          );

          return false;
        }

        if (!response.ok) {
          return false;
        }

        setNotifications(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      is_read:
                        true,
                      read_at:
                        new Date().toISOString(),
                    }
                  : item,
            ),
        );

        window.dispatchEvent(
          new Event(
            "notifications-changed",
          ),
        );

        return true;
      } catch {
        return false;
      }
    };

  // =========================================================
  // OPEN NOTIFICATION
  // =========================================================

  const handleNotificationClick =
    async (
      notification:
        Notification,
    ) => {
      const success =
        await markAsRead(
          notification,
        );

      if (!success) {
        return;
      }

      if (
        notification.link
      ) {
        router.push(
          notification.link,
        );

        return;
      }

      router.push(
        "/dashboard",
      );
    };

  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  const handleMarkAllRead =
    async () => {
      const token =
        localStorage.getItem(
          "token",
        );

      if (!token) {
        router.replace(
          "/login",
        );

        return;
      }

      try {
        setMarkingAll(
          true,
        );

        const response =
          await fetch(
            `${API_URL}/api/notifications/read-all/`,
            {
              method:
                "POST",
              headers: {
                Authorization:
                  `Token ${token}`,
              },
            },
          );

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          localStorage.removeItem(
            "token",
          );

          sessionStorage.removeItem(
            "token",
          );

          router.replace(
            "/login",
          );

          return;
        }

        if (!response.ok) {
          return;
        }

        const now =
          new Date().toISOString();

        setNotifications(
          (current) =>
            current.map(
              (item) => ({
                ...item,
                is_read: true,
                read_at:
                  item.read_at ??
                  now,
              }),
            ),
        );

        window.dispatchEvent(
          new Event(
            "notifications-changed",
          ),
        );
      } finally {
        setMarkingAll(
          false,
        );
      }
    };

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read,
    ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t(
            "loading",
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:py-14">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              RwandaFitness
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              {t(
                "title",
              )}
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500 sm:text-base">
              {unreadCount >
              0
                ? t(
                    "unreadCount",
                    {
                      count:
                        unreadCount,
                    },
                  )
                : t(
                    "allRead",
                  )}
            </p>
          </div>

          {unreadCount >
            0 && (
            <button
              type="button"
              onClick={
                handleMarkAllRead
              }
              disabled={
                markingAll
              }
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {markingAll
                ? t(
                    "markingAll",
                  )
                : t(
                    "markAllRead",
                  )}
            </button>
          )}
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {errorMessage && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {
              errorMessage
            }
          </div>
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!errorMessage &&
          notifications.length ===
            0 && (
            <div className="mt-8 rounded-3xl border border-zinc-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 0 0-12 0v.75a8.967 8.967 0 0 1-2.312 6.022 23.848 23.848 0 0 0 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                  />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-semibold text-zinc-900">
                {t(
                  "empty.title",
                )}
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-zinc-500">
                {t(
                  "empty.description",
                )}
              </p>

              <Link
                href="/dashboard"
                className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                {t(
                  "empty.dashboard",
                )}
              </Link>
            </div>
          )}

        {/* =====================================================
            NOTIFICATIONS LIST
        ===================================================== */}

        {notifications.length >
          0 && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            {notifications.map(
              (
                notification,
                index,
              ) => (
                <button
                  key={
                    notification.id
                  }
                  type="button"
                  onClick={() =>
                    void handleNotificationClick(
                      notification,
                    )
                  }
                  className={`relative flex w-full gap-4 px-5 py-5 text-left transition hover:bg-zinc-50 sm:px-6 ${
                    index !==
                    notifications.length -
                      1
                      ? "border-b border-zinc-200"
                      : ""
                  } ${
                    notification.is_read
                      ? "bg-white"
                      : "bg-primary/[0.04]"
                  }`}
                >
                  {/* ICON */}

                  <div
                    className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      notification.is_read
                        ? "bg-zinc-100 text-zinc-500"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {notification.notification_type ===
                    "coaching_request" ? (
                      <span
                        className="text-lg"
                        aria-hidden="true"
                      >
                        💪
                      </span>
                    ) : notification.notification_type ===
                      "review" ? (
                      <span
                        className="text-lg"
                        aria-hidden="true"
                      >
                        ★
                      </span>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9a6 6 0 0 0-12 0v.75a8.967 8.967 0 0 1-2.312 6.022 23.848 23.848 0 0 0 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                        />
                      </svg>
                    )}
                  </div>

                  {/* CONTENT */}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2
                        className={`text-sm leading-6 ${
                          notification.is_read
                            ? "font-semibold text-zinc-800"
                            : "font-bold text-zinc-900"
                        }`}
                      >
                        {
                          notification.title
                        }
                      </h2>

                      <time className="shrink-0 text-xs text-zinc-400">
                        {formatDate(
                          notification.created_at,
                        )}
                      </time>
                    </div>

                    {notification.message && (
                      <p className="mt-1 text-sm leading-6 text-zinc-600">
                        {
                          notification.message
                        }
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      {!notification.is_read && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <span className="h-2 w-2 rounded-full bg-primary" />

                          {t(
                            "unread",
                          )}
                        </span>
                      )}

                      <span className="text-xs font-semibold text-zinc-500">
                        {t(
                          "open",
                        )}{" "}
                        →
                      </span>
                    </div>
                  </div>

                  {!notification.is_read && (
                    <span
                      className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-accent"
                      aria-hidden="true"
                    />
                  )}
                </button>
              ),
            )}
          </div>
        )}
      </main>
    </div>
  );
}