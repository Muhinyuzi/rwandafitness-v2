"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  const params = useParams();
  const slug = params.slug as string;

  const [gym, setGym] = useState<Gym | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/gyms/${slug}/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load gym.");
        }
        return res.json();
      })
      .then((data) => setGym(data))
      .catch(() => setError("Failed to load gym details."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-zinc-600">
        Loading gym...
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error || "Gym not found."}
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
            No cover image available
          </div>
        )}

        <div className="p-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              {gym.name}
            </h1>

            {gym.is_verified && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ✔ Verified
              </span>
            )}
          </div>

          <p className="mt-3 text-sm text-zinc-500">📍 {gym.city}</p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">About this gym</h2>
              <p className="mt-3 leading-8 text-zinc-600">
                {gym.description || "No description provided."}
              </p>

              {gym.gallery_images?.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-lg font-semibold text-zinc-900">Gallery</h2>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gym.gallery_images.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.caption || "Gym gallery image"}
                            className="h-48 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-48 w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
                            No image
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
                    Coaches at this gym
                  </h2>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {gym.coaches.map((coach) => (
                      <a
                        key={coach.id}
                        href={`/coaches/${coach.id}`}
                        className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          {coach.photo_url ? (
                            <img
                              src={coach.photo_url}
                              alt={coach.full_name}
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                              {coach.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-zinc-900">
                                {coach.full_name}
                              </h3>

                              {coach.is_verified && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                  ✔
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-zinc-500">{coach.specialty}</p>
                            <p className="mt-1 text-xs text-zinc-600">
                              {coach.price_per_session
                                ? `${coach.price_per_session} $ / session`
                                : "Contact for pricing"}
                            </p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="h-fit rounded-2xl bg-zinc-50 p-5">
              <h2 className="text-base font-semibold text-zinc-900">
                Gym information
              </h2>

              <div className="mt-4 space-y-3 text-sm text-zinc-600">
                {gym.address && (
                  <p>
                    <span className="font-medium text-zinc-900">Address:</span>{" "}
                    {gym.address}
                  </p>
                )}

                {gym.phone && (
                  <p>
                    <span className="font-medium text-zinc-900">Phone:</span>{" "}
                    {gym.phone}
                  </p>
                )}

                {gym.email && (
                  <p>
                    <span className="font-medium text-zinc-900">Email:</span>{" "}
                    {gym.email}
                  </p>
                )}

                {gym.website && (
                  <p>
                    <span className="font-medium text-zinc-900">Website:</span>{" "}
                    <a
                      href={gym.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-900 underline"
                    >
                      Visit website
                    </a>
                  </p>
                )}

                {gym.opening_hours && (
                  <p>
                    <span className="font-medium text-zinc-900">Opening hours:</span>{" "}
                    {gym.opening_hours}
                  </p>
                )}

                {gym.instagram && (
                  <p>
                    <span className="font-medium text-zinc-900">Instagram:</span>{" "}
                    <a
                      href={gym.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-900 underline"
                    >
                      View profile
                    </a>
                  </p>
                )}

                {gym.facebook && (
                  <p>
                    <span className="font-medium text-zinc-900">Facebook:</span>{" "}
                    <a
                      href={gym.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-900 underline"
                    >
                      View page
                    </a>
                  </p>
                )}

                {gym.latitude && gym.longitude && (
                  <p>
                    <span className="font-medium text-zinc-900">Coordinates:</span>{" "}
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