"use client";

import {useEffect, useState} from "react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Gym = {
  id: number;
  name: string;
  description: string;
  city: string;
  cover_image_url: string | null;
  is_verified: boolean;
  slug: string | null;
};

type GymsApiResponse =
  | Gym[]
  | {
      results?: Gym[];
    };

export default function GymsPage() {
  const locale = useLocale();
  const t = useTranslations("Gyms");

  const [gyms, setGyms] =
    useState<Gym[]>([]);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // =========================================================
  // LOAD GYMS
  // =========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    const loadGyms = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/gyms/?lang=${locale}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load gyms",
          );
        }

        const data: GymsApiResponse =
          await response.json();

        const gymList =
          Array.isArray(data)
            ? data
            : Array.isArray(
                  data.results,
                )
              ? data.results
              : [];

        setGyms(gymList);
      } catch (caughtError) {
        if (
          caughtError instanceof Error &&
          caughtError.name ===
            "AbortError"
        ) {
          return;
        }

        setGyms([]);

        setError(
          t(
            "messages.loadFailed",
          ),
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    };

    void loadGyms();

    return () => {
      controller.abort();
    };
  }, [locale, t]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50">
        {/* HERO SKELETON */}

        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
            <div className="max-w-2xl">
              <div className="h-1.5 w-14 rounded-full bg-primary" />

              <div className="mt-5 h-10 w-52 animate-pulse rounded-xl bg-zinc-200" />

              <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-zinc-100" />
            </div>
          </div>
        </section>

        {/* CARDS SKELETON */}

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: 6,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-sm"
                >
                  <div className="aspect-[4/3] animate-pulse bg-zinc-200" />

                  <div className="space-y-4 p-5 sm:p-6">
                    <div className="h-7 w-3/4 animate-pulse rounded bg-zinc-200" />

                    <div className="h-4 w-28 animate-pulse rounded bg-zinc-100" />

                    <div className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />

                      <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-zinc-200 bg-white">
        {/* Decorative background */}

        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="pointer-events-none absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
              RwandaFitness
            </span>

            <h1 className="mt-5 text-3xl font-black tracking-[-0.03em] text-zinc-950 sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base sm:leading-8">
              {t("description")}
            </p>

            {gyms.length > 0 && (
              <div className="mt-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-primary" />

                  <span>
                    {gyms.length}{" "}
                    {gyms.length === 1
                      ? "gym"
                      : "gyms"}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="mb-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* EMPTY */}

        {!error &&
          gyms.length === 0 && (
            <div className="rounded-[30px] border border-zinc-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                🏋️
              </div>

              <p className="mt-5 text-sm text-zinc-600">
                {t("empty")}
              </p>
            </div>
          )}

        {/* =====================================================
            GYM GRID
        ====================================================== */}

        {!error &&
          gyms.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {gyms.map((gym) => {
                const content = (
                  <>
                    {/* ===========================
                        IMAGE
                    ============================ */}

                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                      {gym.cover_image_url ? (
                        <img
                          src={
                            gym.cover_image_url
                          }
                          alt={
                            gym.name
                          }
                          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 px-6 text-center">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                            🏋️
                          </div>

                          <p className="mt-4 text-sm font-medium text-zinc-500">
                            {t(
                              "noImage",
                            )}
                          </p>
                        </div>
                      )}

                      {/* Image gradient */}

                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                      {/* VERIFIED */}

                      {gym.is_verified && (
                        <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/95 px-3 py-2 text-xs font-bold text-emerald-700 shadow-lg backdrop-blur">
                          <span>
                            ✓
                          </span>

                          <span>
                            {t(
                              "verified",
                            )}
                          </span>
                        </div>
                      )}

                      {/* CITY */}

                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                        <span className="inline-flex rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                          📍{" "}
                          {
                            gym.city
                          }
                        </span>

                        {gym.slug && (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-primary shadow-lg transition duration-300 group-hover:translate-x-1">
                            →
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ===========================
                        INFORMATION
                    ============================ */}

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <h2 className="text-xl font-black tracking-tight text-zinc-950 transition group-hover:text-primary sm:text-2xl">
                        {
                          gym.name
                        }
                      </h2>

                      <div className="mt-3 flex items-center gap-2 text-sm font-medium text-zinc-500">
                        <span>
                          📍
                        </span>

                        <span>
                          {
                            gym.city
                          }
                        </span>
                      </div>

                      {/* DESCRIPTION */}

                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-600">
                        {gym.description ||
                          t(
                            "noDescription",
                          )}
                      </p>

                      {/* BOTTOM */}

                      {gym.slug && (
                        <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                          <span className="text-sm font-bold text-primary">
                            {gym.name}
                          </span>

                          <span className="text-lg font-bold text-primary transition duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                );

                // =============================================
                // CLICKABLE GYM
                // =============================================

                if (gym.slug) {
                  return (
                    <Link
                      key={
                        gym.id
                      }
                      href={`/gyms/${gym.slug}`}
                      className="group flex overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)] sm:flex-col"
                    >
                      {content}
                    </Link>
                  );
                }

                // =============================================
                // GYM WITHOUT SLUG
                // =============================================

                return (
                  <article
                    key={
                      gym.id
                    }
                    className="group flex overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-sm sm:flex-col"
                  >
                    {content}
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}