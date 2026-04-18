"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/gyms/")
      .then((res) => res.json())
      .then((data) => setGyms(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setError("Failed to load gyms."));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {gyms.map((gym) => (
          <Link
            key={gym.id}
            href={gym.slug ? `/gyms/${gym.slug}` : "#"}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
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
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-zinc-900">{gym.name}</h2>

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
          </Link>
        ))}
      </div>
    </div>
  );
}