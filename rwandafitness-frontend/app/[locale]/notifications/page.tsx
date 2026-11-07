"use client";

import {useCallback, useEffect, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Link, useRouter} from "@/i18n/navigation";
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

type PaginatedNotifications = {results: Notification[]};

function isPaginatedNotifications(data: unknown): data is PaginatedNotifications {
  return !!data && typeof data === "object" && "results" in data &&
    Array.isArray((data as PaginatedNotifications).results);
}

function BellIcon({className = "h-6 w-6"}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
    </svg>
  );
}

export default function NotificationsPage() {
  const locale = useLocale();
  const t = useTranslations("NotificationsPage");
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [openingId, setOpeningId] = useState<number | null>(null);

  const handleAuthError = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-changed"));
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleAuthError();
      return;
    }

    const controller = new AbortController();
    const loadNotifications = async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await fetch(`${API_URL}/api/notifications/`, {
          headers: {Authorization: `Token ${token}`},
          signal: controller.signal,
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          handleAuthError();
          return;
        }
        if (!response.ok) throw new Error("Unable to load notifications.");

        const data: unknown = await response.json();
        if (controller.signal.aborted) return;
        setNotifications(
          Array.isArray(data)
            ? (data as Notification[])
            : isPaginatedNotifications(data) ? data.results : []
        );
      } catch (error) {
        if (controller.signal.aborted ||
          (error instanceof Error && error.name === "AbortError")) return;
        setNotifications([]);
        setErrorMessage(t("messages.loadFailed"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadNotifications();
    return () => controller.abort();
  }, [handleAuthError, t]);

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(date);
  };

  const markAsRead = async (notification: Notification): Promise<boolean> => {
    if (notification.is_read) return true;
    const token = localStorage.getItem("token");
    if (!token) {
      handleAuthError();
      return false;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notification.id}/read/`,
        {method: "POST", headers: {Authorization: `Token ${token}`}}
      );
      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return false;
      }
      if (!response.ok) return false;

      setNotifications(current => current.map(item =>
        item.id === notification.id
          ? {...item, is_read: true, read_at: new Date().toISOString()}
          : item
      ));
      window.dispatchEvent(new Event("notifications-changed"));
      return true;
    } catch {
      return false;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (openingId !== null) return;
    setOpeningId(notification.id);
    try {
      const success = await markAsRead(notification);
      if (!success) return;
      router.push(notification.link || "/dashboard");
    } finally {
      setOpeningId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    const token = localStorage.getItem("token");
    if (!token) {
      handleAuthError();
      return;
    }

    try {
      setMarkingAll(true);
      const response = await fetch(`${API_URL}/api/notifications/read-all/`, {
        method: "POST",
        headers: {Authorization: `Token ${token}`},
      });
      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }
      if (!response.ok) return;

      const now = new Date().toISOString();
      setNotifications(current => current.map(item => ({
        ...item, is_read: true, read_at: item.read_at ?? now,
      })));
      window.dispatchEvent(new Event("notifications-changed"));
    } catch {
      // Preserve current notifications if the request fails.
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(item => !item.is_read).length;

  return (
    <div className="min-h-screen bg-[#F3FAF6] text-[#17251E]">
      <div className="relative overflow-hidden bg-[#003D24] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border border-[#00CFFF]/25" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-12 h-64 w-64 rounded-full border border-[#FFD21A]/20" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#00CFFF]">
              <BellIcon className="h-4 w-4" /> RwandaFitness
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{t("title")}</h1>
            {!loading && (
              <p className="mt-4 text-sm leading-7 text-white/75 sm:text-base">
                {unreadCount > 0 ? t("unreadCount", {count: unreadCount}) : t("allRead")}
              </p>
            )}
          </div>
          {!loading && unreadCount > 0 && (
            <button type="button" onClick={() => void handleMarkAllRead()}
              disabled={markingAll}
              className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#FFD21A] px-5 py-3 text-sm font-bold text-[#003D24] shadow-lg shadow-black/10 transition hover:bg-[#ffe15e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00CFFF] disabled:cursor-not-allowed disabled:opacity-60">
              {markingAll ? t("markingAll") : t("markAllRead")}
            </button>
          )}
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-12">
        {errorMessage && (
          <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {loading && (
          <div role="status" className="rounded-3xl border border-[#DCEDE2] bg-white p-7 text-sm text-[#52675B] shadow-sm">
            <div className="mb-4 h-2 w-16 rounded-full bg-[#00CFFF]" />
            {t("loading")}
          </div>
        )}

        {!loading && !errorMessage && notifications.length === 0 && (
          <div className="rounded-[32px] border border-[#DCEDE2] bg-white px-6 py-14 text-center shadow-[0_16px_50px_rgba(0,61,36,0.05)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E5F6EC] text-[#007D36]">
              <BellIcon className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-xl font-bold sm:text-2xl">{t("empty.title")}</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#52675B]">{t("empty.description")}</p>
            <Link href="/dashboard" className="mt-7 inline-flex rounded-xl bg-[#007D36] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#075C38]">
              {t("empty.dashboard")}
            </Link>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="overflow-hidden rounded-[32px] border border-[#DCEDE2] bg-white shadow-[0_16px_50px_rgba(0,61,36,0.06)]">
            {notifications.map((notification, index) => (
              <button key={notification.id} type="button"
                onClick={() => void handleNotificationClick(notification)}
                disabled={openingId !== null}
                className={`group relative flex w-full gap-4 px-5 py-6 text-left transition hover:bg-[#F3FAF6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#00CFFF] disabled:cursor-wait sm:px-7 ${index !== notifications.length - 1 ? "border-b border-[#E2EFE7]" : ""} ${notification.is_read ? "bg-white" : "bg-[#EAF8F0]"}`}>
                <div className={`mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${notification.is_read ? "bg-[#F0F4F1] text-[#52675B]" : "bg-[#D5F2E2] text-[#007D36]"}`}>
                  {notification.notification_type === "coaching_request" ? (
                    <span className="text-xl" aria-hidden="true">💪</span>
                  ) : notification.notification_type === "review" ? (
                    <span className="text-2xl text-[#D49C00]" aria-hidden="true">★</span>
                  ) : (
                    <BellIcon />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-1">
                    <h2 className={`text-sm leading-6 sm:text-base ${notification.is_read ? "font-semibold text-[#304A3B]" : "font-extrabold text-[#003D24]"}`}>
                      {notification.title}
                    </h2>
                    <time dateTime={notification.created_at} className="shrink-0 text-xs text-[#66796D]">
                      {formatDate(notification.created_at)}
                    </time>
                  </div>
                  {notification.message && (
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#52675B]">{notification.message}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    {!notification.is_read && (
                      <span className="inline-flex items-center gap-2 text-xs font-bold text-[#007D36]">
                        <span className="h-2 w-2 rounded-full bg-[#007D36]" />{t("unread")}
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#075C38] transition group-hover:underline">
                      {t("open")} <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
                {!notification.is_read && (
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#FFD21A]" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
