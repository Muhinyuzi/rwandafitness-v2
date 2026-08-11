"use client";

import {useEffect, useState} from "react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

import {Link} from "@/i18n/navigation";
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

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] =
    useState<Coach | null>(null);
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

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
          throw new Error("Failed to load coaches");
        }

        const data: Coach[] | PaginatedCoachResponse =
          await response.json();

        if (Array.isArray(data)) {
          setCoaches(data);
        } else {
          setCoaches(data.results ?? []);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setCoaches([]);
        setStatusMessage(t("messages.loadFailed"));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadCoaches();

    return () => {
      controller.abort();
    };
  }, [locale, t]);

  const openRequestForm = (coach: Coach) => {
    setSelectedCoach(coach);
    setGoal("");
    setMessage("");
    setStatusMessage("");
  };

  const closeRequestForm = () => {
    setSelectedCoach(null);
    setGoal("");
    setMessage("");
  };

  const formatApiError = (data: unknown) => {
    if (!data || typeof data !== "object") {
      return t("messages.requestFailed");
    }

    const errorObject = data as Record<string, unknown>;
    const firstEntry = Object.entries(errorObject)[0];

    if (!firstEntry) {
      return t("messages.requestFailed");
    }

    const [, value] = firstEntry;

    if (Array.isArray(value)) {
      return value.join(" ");
    }

    if (typeof value === "string") {
      return value;
    }

    return t("messages.requestFailed");
  };

  const handleSendRequest = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatusMessage(t("messages.loginRequired"));
      return;
    }

    if (!selectedCoach) {
      return;
    }

    if (!goal.trim()) {
      setStatusMessage(t("messages.goalRequired"));
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage("");

      const response = await fetch(
        `${API_URL}/api/requests/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            coach: selectedCoach.id,
            goal: goal.trim(),
            message: message.trim(),
          }),
        },
      );

      let data: unknown = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        setStatusMessage(formatApiError(data));
        return;
      }

      closeRequestForm();
      setStatusMessage(t("messages.requestSent"));
    } catch {
      setStatusMessage(t("messages.requestFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-zinc-900">
        {t("title")}
      </h1>

      {statusMessage && (
        <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          {statusMessage}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("loading")}
        </div>
      ) : coaches.length === 0 && !statusMessage ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("empty")}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {coaches.map((coach) => (
            <Link
              key={coach.id}
              href={`/coaches/${coach.id}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 h-1.5 w-14 rounded-full bg-primary" />

              {coach.photo_url ? (
                <img
                  src={coach.photo_url}
                  className="mb-4 h-16 w-16 rounded-full object-cover"
                  alt={coach.full_name}
                />
              ) : (
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                  {coach.full_name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-zinc-900">
                  {coach.full_name}
                </h3>

                {coach.is_verified && (
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                    ✔ {t("verified")}
                  </span>
                )}
              </div>

              <div className="mt-2 inline-block rounded bg-primary/10 px-3 py-1 text-sm text-primary">
                {coach.specialty_display || coach.specialty}
              </div>

              <p className="mt-2 text-sm text-zinc-500">
                📍 {coach.city}
              </p>

              {coach.gym_name && (
                <p className="mt-2 text-sm text-zinc-600">
                  {t("worksAt")}{" "}
                  <span className="font-medium underline">
                    {coach.gym_name}
                  </span>
                </p>
              )}

              <p className="mt-2 font-semibold text-zinc-900">
                {coach.price_per_session
                  ? t("pricePerSession", {
                      price: coach.price_per_session,
                    })
                  : t("contactForPrice")}
              </p>

              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openRequestForm(coach);
                }}
                className="mt-4 w-full rounded-lg bg-primary py-2 text-white transition hover:bg-primary-dark"
              >
                {t("requestCoaching")}
              </button>
            </Link>
          ))}
        </div>
      )}

      {selectedCoach && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeRequestForm}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="coaching-request-title"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="coaching-request-title"
              className="mb-2 text-lg font-semibold text-zinc-900"
            >
              {t("form.title", {
                name: selectedCoach.full_name,
              })}
            </h2>

            <label
              htmlFor="coaching-goal"
              className="mt-4 block text-sm font-medium text-zinc-700"
            >
              {t("form.goalLabel")}
            </label>

            <input
              id="coaching-goal"
              type="text"
              placeholder={t("form.goalPlaceholder")}
              value={goal}
              onChange={(event) =>
                setGoal(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-primary"
            />

            <label
              htmlFor="coaching-message"
              className="mt-4 block text-sm font-medium text-zinc-700"
            >
              {t("form.messageLabel")}
            </label>

            <textarea
              id="coaching-message"
              placeholder={t("form.messagePlaceholder")}
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              rows={5}
              className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-primary"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={closeRequestForm}
                disabled={submitting}
                className="w-full rounded-lg border border-zinc-300 py-2 text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
              >
                {t("form.cancel")}
              </button>

              <button
                type="button"
                onClick={handleSendRequest}
                disabled={submitting}
                className="w-full rounded-lg bg-primary py-2 text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting
                  ? t("form.sending")
                  : t("form.send")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}