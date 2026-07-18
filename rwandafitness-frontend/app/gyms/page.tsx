"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type Gym = {
  id: number;
  name: string;
  description: string;
  city: string;
  cover_image_url: string | null;
  is_verified: boolean;
  slug: string | null;
};

export default function GymsPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/gyms/`)
      .then((res) => res.json())
      .then((data) => {
        setGyms(Array.isArray(data) ? data : data.results ?? []);
        setError("");
      })
      .catch(() => setError("Failed to load gyms."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
          RwandaFitness
        </span>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
          Discover Gyms
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Explore gyms and fitness spaces across Rwanda.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          Loading gyms...
        </div>
      )}

      {!loading && !error && gyms.length === 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">
          No gyms available yet.
        </div>
      )}

      {!loading && !error && gyms.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {gyms.map((gym) => {
            const content = (
              <>
                {gym.cover_image_url ? (
                  <img
                    src={gym.cover_image_url}
                    alt={gym.name}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500">
                    No image available
                  </div>
                )}

                <div className="p-5">
                  <div className="mb-3 h-1.5 w-14 rounded-full bg-primary" />

                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {gym.name}
                    </h2>

                    {gym.is_verified && (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                        ✔ Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-zinc-500">📍 {gym.city}</p>

                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-zinc-600">
                    {gym.description || "No description provided."}
                  </p>
                </div>
              </>
            );

            if (gym.slug) {
              return (
                <Link
                  key={gym.id}
                  href={`/gyms/${gym.slug}`}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={gym.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}