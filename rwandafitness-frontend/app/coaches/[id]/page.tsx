"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type CoachGalleryImage = {
  id: number;
  image_url: string | null;
  caption: string;
  sort_order: number;
};

type Coach = {
  id: number;
  full_name: string;
  bio: string;
  specialty: string;
  city: string;
  price_per_session: string | null;
  photo_url: string | null;
  is_verified: boolean;
  years_experience?: number;
  available_online?: boolean;
  available_in_person?: boolean;
  gym_name?: string | null;
  gym_slug?: string | null;
  gallery_images?: CoachGalleryImage[];
};

export default function CoachDetailPage() {
  const params = useParams();
  const id = params.id;

  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showRequestBox, setShowRequestBox] = useState(false);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/coaches/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setCoach(data);
        setLoading(false);
      })
      .catch(() => {
        setCoach(null);
        setLoading(false);
      });
  }, [id]);

  const handleSendRequest = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatusMessage("Please log in as a client first.");
      return;
    }

    if (!coach) return;

    if (!goal.trim()) {
      setStatusMessage("Please enter your goal.");
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage("");

      const res = await fetch("http://127.0.0.1:8000/api/requests/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          coach: coach.id,
          goal: goal.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage(
          typeof data === "object" ? JSON.stringify(data) : "Failed to send request."
        );
        return;
      }

      setStatusMessage("Coaching request sent successfully.");
      setGoal("");
      setMessage("");
      setShowRequestBox(false);
    } catch {
      setStatusMessage("Something went wrong while sending the request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-10">Loading...</div>;
  }

  if (!coach) {
    return <div className="mx-auto max-w-5xl px-6 py-10">Coach not found.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {statusMessage && (
        <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          {statusMessage}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {coach.photo_url ? (
              <img
                src={coach.photo_url}
                alt={coach.full_name}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black text-3xl font-bold text-white">
                {coach.full_name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
                  {coach.full_name}
                </h1>

                {coach.is_verified && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    ✔ Verified
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">
                  {coach.specialty}
                </span>
                <span>📍 {coach.city}</span>
                {coach.years_experience !== undefined && (
                  <span>{coach.years_experience} years experience</span>
                )}
              </div>

              {coach.gym_name && (
                <p className="mt-3 text-sm text-zinc-600">
                  Works at{" "}
                  {coach.gym_slug ? (
                    <a href={`/gyms/${coach.gym_slug}`} className="font-medium underline">
                      {coach.gym_name}
                    </a>
                  ) : (
                    <span className="font-medium">{coach.gym_name}</span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-zinc-900">About this coach</h2>
            <p className="mt-3 leading-8 text-zinc-600">
              {coach.bio || "No description provided."}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-zinc-50 p-5">
              <h3 className="text-sm font-semibold text-zinc-900">Coaching format</h3>
              <div className="mt-3 space-y-2 text-sm text-zinc-600">
                <p>{coach.available_online ? "✅ Online coaching available" : "❌ No online coaching"}</p>
                <p>{coach.available_in_person ? "✅ In-person coaching available" : "❌ No in-person coaching"}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-5">
              <h3 className="text-sm font-semibold text-zinc-900">Specialty</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                This coach specializes in <strong>{coach.specialty}</strong> and can help
                clients with personalized support based on their goals.
              </p>
            </div>
          </div>

          {coach.gallery_images && coach.gallery_images.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-zinc-900">Gallery</h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {coach.gallery_images.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.caption || "Coach gallery image"}
                        className="h-48 w-full object-cover"
                      />
                    )}
                    {item.caption && (
                      <div className="p-3 text-sm text-zinc-600">{item.caption}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Starting from</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            {coach.price_per_session ? `${coach.price_per_session} $` : "Contact"}
          </p>

          <p className="mt-1 text-sm text-zinc-500">per session</p>

          <button
            onClick={() => setShowRequestBox((prev) => !prev)}
            className="mt-6 w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            {showRequestBox ? "Close Request Form" : "Request Coaching"}
          </button>

          <div className="mt-6 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
            <p className="mb-2">✔ Direct request from the platform</p>
            <p className="mb-2">✔ Quick and simple contact flow</p>
            <p>✔ Designed for clear coaching requests</p>
          </div>

          {showRequestBox && (
            <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
              <h3 className="text-base font-semibold text-zinc-900">
                Send a coaching request
              </h3>

              <label className="mt-4 block text-sm font-medium text-zinc-700">
                Your goal
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Weight loss, muscle gain, home fitness..."
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
              />

              <label className="mt-4 block text-sm font-medium text-zinc-700">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a short message for the coach..."
                rows={5}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
              />

              <button
                onClick={handleSendRequest}
                disabled={submitting}
                className="mt-4 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-70"
              >
                {submitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}