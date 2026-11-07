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
      return () => controller.abort();
    }

    const redirectToDashboard = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me/`, {
          headers: {Authorization: `Token ${token}`},
          signal: controller.signal,
          cache: "no-store",
        });

        if (controller.signal.aborted) return;

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
        if (controller.signal.aborted) return;

        router.replace(
          user.role === "coach" ? "/dashboard/coach" : "/dashboard/client",
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof Error && error.name === "AbortError") return;

        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        router.replace("/login");
      }
    };

    void redirectToDashboard();
    return () => controller.abort();
  }, [router]);

  return (
    <main className="relative isolate flex min-h-[75vh] items-center justify-center overflow-hidden bg-[#F3FAF6] px-4 py-16 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#00CFFF]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-[#007D36]/10 blur-3xl" />

      <section aria-live="polite" aria-busy="true" className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-[#075C38]/10 bg-white p-8 text-center shadow-[0_24px_80px_rgba(0,61,36,0.10)] sm:p-12">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#007D36] via-[#00CFFF] to-[#FFD21A]" />

        <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#F3FAF6] ring-1 ring-[#075C38]/10">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span aria-hidden="true" className="absolute inset-0 animate-spin rounded-full border-[5px] border-[#007D36]/15 border-t-[#007D36] border-r-[#00CFFF]" />
            <span aria-hidden="true" className="text-lg font-black tracking-[-0.08em] text-[#003D24]">RF</span>
          </div>
        </div>

        <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-[#007D36]">RwandaFitness</p>
        <h1 className="text-2xl font-black tracking-tight text-[#003D24] sm:text-3xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#52645A] sm:text-base">{t("description")}</p>

        <div aria-hidden="true" className="mx-auto mt-8 h-1.5 max-w-[220px] overflow-hidden rounded-full bg-[#007D36]/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#007D36] to-[#00CFFF]" />
        </div>
      </section>
    </main>
  );
}
