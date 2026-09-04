"use client";

import {useEffect, useState} from "react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

import {
  Link,
  useRouter,
} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Coach = {
  id: number;
  full_name: string;
  specialty: string;
  specialty_display?: string;
  city: string;
  price_per_session: string | null;
  photo: string | null;
  photo_url?: string | null;
  is_verified: boolean;
  gym_name?: string | null;
  gym_slug?: string | null;
};

type PaginatedCoachResponse = {
  results?: Coach[];
};

export default function CoachesPage() {
  const locale = useLocale();
  const t = useTranslations("Coaches");
  const router = useRouter();

  const [coaches, setCoaches] =
    useState<Coach[]>([]);

  const [
    selectedCoach,
    setSelectedCoach,
  ] = useState<Coach | null>(null);

  const [goal, setGoal] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [
    statusMessage,
    setStatusMessage,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  // =========================================================
  // LOAD COACHES
  // =========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    const loadCoaches = async () => {
      try {
        setLoading(true);
        setStatusMessage("");

        const response = await fetch(
          `${API_URL}/api/coaches/?lang=${locale}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load coaches",
          );
        }

        const data:
          | Coach[]
          | PaginatedCoachResponse =
          await response.json();

        if (Array.isArray(data)) {
          setCoaches(data);
        } else {
          setCoaches(
            data.results ?? [],
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setCoaches([]);

        setStatusMessage(
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

    void loadCoaches();

    return () => {
      controller.abort();
    };
  }, [locale, t]);

  // =========================================================
  // OPEN REQUEST FORM
  // =========================================================

  const openRequestForm = (
    coach: Coach,
  ) => {
    const token =
      localStorage.getItem(
        "token",
      );

    if (!token) {
      router.push("/login");
      return;
    }

    setSelectedCoach(coach);
    setGoal("");
    setMessage("");
    setStatusMessage("");
  };

  // =========================================================
  // CLOSE REQUEST FORM
  // =========================================================

  const closeRequestForm = () => {
    setSelectedCoach(null);
    setGoal("");
    setMessage("");
  };

  // =========================================================
  // FORMAT API ERROR
  // =========================================================

  const formatApiError = (
    data: unknown,
  ) => {
    if (
      !data ||
      typeof data !== "object"
    ) {
      return t(
        "messages.requestFailed",
      );
    }

    const errorObject =
      data as Record<
        string,
        unknown
      >;

    const firstEntry =
      Object.entries(
        errorObject,
      )[0];

    if (!firstEntry) {
      return t(
        "messages.requestFailed",
      );
    }

    const [, value] =
      firstEntry;

    if (Array.isArray(value)) {
      return value.join(" ");
    }

    if (
      typeof value === "string"
    ) {
      return value;
    }

    return t(
      "messages.requestFailed",
    );
  };

  // =========================================================
  // SEND REQUEST
  // =========================================================

  const handleSendRequest =
    async () => {
      const token =
        localStorage.getItem(
          "token",
        );

      if (!token) {
        closeRequestForm();
        router.push("/login");
        return;
      }

      if (!selectedCoach) {
        return;
      }

      if (!goal.trim()) {
        setStatusMessage(
          t(
            "messages.goalRequired",
          ),
        );
        return;
      }

      try {
        setSubmitting(true);
        setStatusMessage("");

        const response =
          await fetch(
            `${API_URL}/api/requests/create/`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Token ${token}`,
              },

              body: JSON.stringify(
                {
                  coach:
                    selectedCoach.id,

                  goal:
                    goal.trim(),

                  message:
                    message.trim(),
                },
              ),
            },
          );

        let data: unknown =
          null;

        try {
          data =
            await response.json();
        } catch {
          data = null;
        }

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem(
            "token",
          );

          closeRequestForm();
          router.push("/login");

          return;
        }

        if (!response.ok) {
          setStatusMessage(
            formatApiError(data),
          );
          return;
        }

        closeRequestForm();

        setStatusMessage(
          t(
            "messages.requestSent",
          ),
        );
      } catch {
        setStatusMessage(
          t(
            "messages.requestFailed",
          ),
        );
      } finally {
        setSubmitting(false);
      }
    };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
            <div className="max-w-2xl">
              <div className="h-1.5 w-14 rounded-full bg-primary" />

              <div className="mt-5 h-10 w-56 animate-pulse rounded-xl bg-zinc-200" />

              <div className="mt-4 h-5 w-full max-w-xl animate-pulse rounded bg-zinc-100" />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: 6,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-sm"
                >
                  <div className="aspect-[4/5] animate-pulse bg-zinc-200" />

                  <div className="space-y-4 p-5">
                    <div className="h-6 w-36 animate-pulse rounded bg-zinc-200" />

                    <div className="h-4 w-24 animate-pulse rounded bg-zinc-100" />

                    <div className="h-4 w-40 animate-pulse rounded bg-zinc-100" />

                    <div className="h-11 animate-pulse rounded-xl bg-zinc-100" />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-zinc-200 bg-white">
        <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

        <div className="absolute -left-24 bottom-0 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
          <div className="max-w-3xl">
            <div className="h-1.5 w-14 rounded-full bg-primary" />

            <h1 className="mt-5 text-3xl font-black tracking-[-0.03em] text-zinc-950 sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {coaches.length > 0 && (
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />

                  <span>
                    {coaches.length}{" "}
                    {coaches.length === 1
                      ? "coach"
                      : "coaches"}
                  </span>
                </div>
              )}

              <div className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-500">
                RwandaFitness
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        {statusMessage && (
          <div className="mb-7 rounded-2xl border border-primary/20 bg-primary/[0.05] px-5 py-4 text-sm font-medium text-zinc-700">
            {statusMessage}
          </div>
        )}

        {coaches.length === 0 &&
        !statusMessage ? (
          <div className="rounded-[30px] border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-600 shadow-sm sm:p-12">
            {t("empty")}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coaches.map(
              (coach) => {
                const specialty =
                  coach.specialty_display ||
                  coach.specialty;

                const coachPhoto =
                  coach.photo_url ||
                  coach.photo;

                return (
                  <article
                    key={coach.id}
                    className="group relative overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]"
                  >
                    {/* ===========================
                        CLICKABLE PROFILE AREA
                    ============================ */}

                    <Link
                      href={`/coaches/${coach.id}`}
                      className="block"
                    >
                      {/* ===========================
                          PHOTO
                      ============================ */}

                      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
                        {coachPhoto ? (
                          <img
                            src={
                              coachPhoto
                            }
                            alt={
                              coach.full_name
                            }
                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
                            <span className="text-7xl font-black text-white/90 sm:text-8xl">
                              {coach.full_name
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Photo gradient */}

                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

                        {/* Verified */}

                        {coach.is_verified && (
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

                        {/* City */}

                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="flex items-end justify-between gap-3">
                            <span className="inline-flex items-center rounded-full bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                              📍{" "}
                              {
                                coach.city
                              }
                            </span>

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-primary shadow-lg transition duration-300 group-hover:translate-x-1">
                              →
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ===========================
                          PROFILE INFO
                      ============================ */}

                      <div className="px-5 pb-4 pt-5 sm:px-6">
                        <h2 className="text-xl font-black tracking-tight text-zinc-950 transition group-hover:text-primary sm:text-2xl">
                          {
                            coach.full_name
                          }
                        </h2>

                        <div className="mt-2">
                          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary sm:text-sm">
                            {
                              specialty
                            }
                          </span>
                        </div>

                        {coach.gym_name && (
                          <div className="mt-5 flex items-start gap-3 border-t border-zinc-100 pt-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-base">
                              🏋️
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs font-medium text-zinc-400">
                                {t(
                                  "worksAt",
                                )}
                              </p>

                              <p className="mt-0.5 truncate text-sm font-semibold text-zinc-700">
                                {
                                  coach.gym_name
                                }
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mt-5 flex items-end justify-between gap-4 border-t border-zinc-100 pt-4">
                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                              {coach.price_per_session
                                ? t(
                                    "pricePerSession",
                                    {
                                      price:
                                        coach.price_per_session,
                                    },
                                  )
                                : t(
                                    "contactForPrice",
                                  )}
                            </p>
                          </div>

                          <span className="shrink-0 text-sm font-bold text-primary">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* ===========================
                        REQUEST BUTTON
                    ============================ */}

                    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                      <button
                        type="button"
                        onClick={() =>
                          openRequestForm(
                            coach,
                          )
                        }
                        className="group/button flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/15 transition hover:bg-primary-dark active:scale-[0.99]"
                      >
                        <span>
                          {t(
                            "requestCoaching",
                          )}
                        </span>

                        <span className="transition group-hover/button:translate-x-0.5">
                          →
                        </span>
                      </button>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          REQUEST MODAL
      ====================================================== */}

      {selectedCoach && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onClick={
            closeRequestForm
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="coaching-request-title"
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-[30px] bg-white shadow-2xl sm:max-w-lg sm:rounded-[30px]"
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            {/* Modal header */}

            <div className="relative overflow-hidden border-b border-zinc-100 p-5 sm:p-6">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

              <div className="relative flex items-start gap-4">
                {/* Coach image */}

                {selectedCoach.photo_url ||
                selectedCoach.photo ? (
                  <img
                    src={
                      selectedCoach.photo_url ||
                      selectedCoach.photo ||
                      ""
                    }
                    alt={
                      selectedCoach.full_name
                    }
                    className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-sm sm:h-20 sm:w-20"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-white sm:h-20 sm:w-20">
                    {selectedCoach.full_name
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                    {
                      selectedCoach.specialty_display ||
                      selectedCoach.specialty
                    }
                  </p>

                  <h2
                    id="coaching-request-title"
                    className="mt-1 text-xl font-black tracking-tight text-zinc-950 sm:text-2xl"
                  >
                    {t(
                      "form.title",
                      {
                        name:
                          selectedCoach.full_name,
                      },
                    )}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    📍{" "}
                    {
                      selectedCoach.city
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeRequestForm
                  }
                  disabled={
                    submitting
                  }
                  aria-label="Close"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl text-zinc-600 transition hover:bg-zinc-200 disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Form */}

            <div className="p-5 sm:p-6">
              {statusMessage && (
                <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/[0.05] px-4 py-3 text-sm font-medium text-zinc-700">
                  {
                    statusMessage
                  }
                </div>
              )}

              <label
                htmlFor="coaching-goal"
                className="block text-sm font-bold text-zinc-800"
              >
                {t(
                  "form.goalLabel",
                )}
              </label>

              <input
                id="coaching-goal"
                type="text"
                placeholder={t(
                  "form.goalPlaceholder",
                )}
                value={goal}
                onChange={(
                  event,
                ) =>
                  setGoal(
                    event.target
                      .value,
                  )
                }
                className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />

              <label
                htmlFor="coaching-message"
                className="mt-5 block text-sm font-bold text-zinc-800"
              >
                {t(
                  "form.messageLabel",
                )}
              </label>

              <textarea
                id="coaching-message"
                placeholder={t(
                  "form.messagePlaceholder",
                )}
                value={message}
                onChange={(
                  event,
                ) =>
                  setMessage(
                    event.target
                      .value,
                  )
                }
                rows={5}
                className="mt-2 w-full resize-none rounded-2xl border border-zinc-300 bg-white px-4 py-3.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
              />

              {/* Buttons */}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={
                    closeRequestForm
                  }
                  disabled={
                    submitting
                  }
                  className="rounded-2xl border border-zinc-300 bg-white px-4 py-3.5 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t(
                    "form.cancel",
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    handleSendRequest
                  }
                  disabled={
                    submitting
                  }
                  className="rounded-2xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting
                    ? t(
                        "form.sending",
                      )
                    : t(
                        "form.send",
                      )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}