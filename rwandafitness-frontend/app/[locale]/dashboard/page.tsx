"use client";

import {useEffect} from "react";
import {useTranslations} from "next-intl";

import {useRouter} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type CurrentUser = {
  role: string;
};

export default function DashboardPage() {
  const t = useTranslations("DashboardRedirect");
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");

      return () => {
        controller.abort();
      };
    }

    const redirectToDashboard = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
          signal: controller.signal,
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");

          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load current user");
        }

        const user: CurrentUser = await response.json();

        if (user.role === "coach") {
          router.replace("/dashboard/coach");
          return;
        }

        router.replace("/dashboard/client");
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        router.replace("/login");
      }
    };

    void redirectToDashboard();

    return () => {
      controller.abort();
    };
  }, [router]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
        />

        <h1 className="text-2xl font-bold text-zinc-900">
          {t("title")}
        </h1>

        <p className="mt-3 text-sm text-zinc-600">
          {t("description")}
        </p>
      </div>
    </div>
  );
}