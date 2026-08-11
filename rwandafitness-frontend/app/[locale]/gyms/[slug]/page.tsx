"use client";

import {useEffect, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useParams} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type GymGalleryImage = {
  id: number;
  image_url: string | null;
  caption: string;
  sort_order: number;
};

type GymCoach = {
  id: number;
  full_name: string;
  specialty: string;
  city: string;
  price_per_session: string | null;
  is_verified: boolean;
  photo_url: string | null;
};

type Gym = {
  id: number;
  name: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  opening_hours: string;
  cover_image_url: string | null;
  instagram: string;
  facebook: string;
  latitude: string | null;
  longitude: string | null;
  slug: string;
  is_verified: boolean;
  gallery_images: GymGalleryImage[];
  coaches: GymCoach[];
};

export default function GymDetailPage() {
  const locale = useLocale();
  const t = useTranslations("GymDetail");
  const params = useParams();

  const slug =
    typeof params.slug === "string"
      ? params.slug
      : Array.isArray(params.slug)
        ? params.slug[0]
        : "";

  const [gym, setGym] = useState<Gym | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadGym = async () => {
      try {
        setLoading(true);
        setError("");
        setGym(null);

        const response = await fetch(
          `${API_URL}/api/gyms/${encodeURIComponent(slug)}/?lang=${locale}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (response.status === 404) {
          setError(t("messages.notFound"));
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load gym");
        }

        const data: Gym = await response.json();

        setGym(data);
      } catch (caughtError) {
        if (
          caughtError instanceof Error &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError(t("messages.loadFailed"));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      void loadGym();
    } else {
      setLoading(false);
      setError(t("messages.notFound"));
    }

    return () => {
      controller.abort();
    };
  }, [slug, locale, t]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          {t("loading")}
        </div>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error || t("messages.notFound")}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        {gym.cover_image_url ? (
          <img
            src={gym.cover_image_url}
            alt={gym.name}
            className="h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
            {t("coverUnavailable")}
          </div>
        )}

        <div className="p-8">
          <div className="mb-4 h-1.5 w-16 rounded-full bg-primary" />

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              {gym.name}
            </h1>

            {gym.is_verified && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ✔ {t("verified")}
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-zinc-500">
            📍 {gym.city}
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">
                {t("about.title")}
              </h2>

              <p className="mt-3 whitespace-pre-line leading-8 text-zinc-600">
                {gym.description || t("about.empty")}
              </p>

              {gym.gallery_images?.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {t("gallery.title")}
                  </h2>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gym.gallery_images.map((item, index) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={
                              item.caption ||
                              t("gallery.imageAlt", {
                                number: index + 1,
                              })
                            }
                            className="h-48 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-48 w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
                            {t("gallery.noImage")}
                          </div>
                        )}

                        {item.caption && (
                          <div className="p-3 text-sm text-zinc-600">
                            {item.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gym.coaches?.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {t("coaches.title")}
                  </h2>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gym.coaches.map((coach) => (
                      <Link
                        key={coach.id}
                        href={`/coaches/${coach.id}`}
                        className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          {coach.photo_url ? (
                            <img
                              src={coach.photo_url}
                              alt={coach.full_name}
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                              {coach.full_name
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-sm font-semibold text-zinc-900">
                                {coach.full_name}
                              </h3>

                              {coach.is_verified && (
                                <span
                                  title={t("verified")}
                                  className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700"
                                >
                                  ✔
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-zinc-500">
                              {coach.specialty}
                            </p>

                            <p className="mt-1 text-xs text-zinc-600">
                              {coach.price_per_session
                                ? t("coaches.pricePerSession", {
                                    price: coach.price_per_session,
                                  })
                                : t("coaches.contactForPrice")}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-zinc-900">
                {t("information.title")}
              </h2>

              <div className="mt-4 space-y-3 text-sm text-zinc-600">
                {gym.address && (
                  <p>
                    <span className="font-medium text-zinc-900">
                      {t("information.address")}:
                    </span>{" "}
                    {gym.address}
                  </p>
                )}

                {gym.phone && (
                  <p>
                    <span className="font-medium text-zinc-900">
                      {t("information.phone")}:
                    </span>{" "}
                    <a
                      href={`tel:${gym.phone}`}
                      className="text-primary underline"
                    >
                      {gym.phone}
                    </a>
                  </p>
                )}

                {gym.email && (
                  <p>
                    <span className="font-medium text-zinc-900">
                      {t("information.email")}:
                    </span>{" "}
                    <a
                      href={`mailto:${gym.email}`}
                      className="break-all text-primary underline"
                    >
                      {gym.email}
                    </a>
                  </p>
                )}

                {gym.website && (
                  <p>
                    <span className="font-medium text-zinc-900">
                      {t("information.website")}:
                    </span>{" "}
                    <a
                      href={gym.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      {t("information.visitWebsite")}
                    </a>
                  </p>
                )}

                {gym.opening_hours && (
                  <p>
                    <span className="font-medium text-zinc-900">
                      {t("information.openingHours")}:
                    </span>{" "}
                    {gym.opening_hours}
                  </p>
                )}

                {gym.instagram && (
                  <p>
                    <span className="font-medium text-zinc-900">
                      Instagram:
                    </span>{" "}
                    <a
                      href={gym.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      {t("information.viewProfile")}
                    </a>
                  </p>
                )}

                {gym.facebook && (
                  <p>
                    <span className="font-medium text-zinc-900">
                      Facebook:
                    </span>{" "}
                    <a
                      href={gym.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      {t("information.viewPage")}
                    </a>
                  </p>
                )}

                {gym.latitude && gym.longitude && (
                  <p>
                    <span className="font-medium text-zinc-900">
                      {t("information.coordinates")}:
                    </span>{" "}
                    {gym.latitude}, {gym.longitude}
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}