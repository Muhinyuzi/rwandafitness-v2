"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Coach = {
  id: number;
  full_name: string;
  specialty: string;
  city: string;
  price_per_session: string | null;
  photo: string | null;
  photo_url?: string | null;
  is_verified: boolean;
  gym_name?: string | null;
  gym_slug?: string | null;
};

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/coaches/")
      .then((res) => res.json())
      .then((data) => setCoaches(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setStatusMessage("Failed to load coaches."));
  }, []);

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

  const handleSendRequest = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setStatusMessage("Please log in as a client first.");
      return;
    }

    if (!selectedCoach) return;

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
          coach: selectedCoach.id,
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
      setSelectedCoach(null);
    } catch {
      setStatusMessage("Something went wrong while sending the request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-6 text-3xl font-semibold">Find a Coach</h1>

      {statusMessage && (
        <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          {statusMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {coaches.map((coach) => (
          <Link key={coach.id} href={`/coaches/${coach.id}`}>
            <div className="cursor-pointer rounded-2xl border p-5 shadow-sm transition hover:shadow-md bg-white">
              {coach.photo_url ? (
                <img
                  src={coach.photo_url}
                  className="mb-4 h-16 w-16 rounded-full object-cover"
                  alt={coach.full_name}
                />
              ) : (
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
                  {coach.full_name.charAt(0)}
                </div>
              )}

              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{coach.full_name}</h3>

                {coach.is_verified && (
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                    ✔ Verified
                  </span>
                )}
              </div>

              <div className="mt-2 inline-block rounded bg-zinc-100 px-3 py-1 text-sm">
                {coach.specialty}
              </div>

              <p className="mt-2 text-sm text-zinc-500">📍 {coach.city}</p>

              {coach.gym_name && (
                <p className="mt-2 text-sm text-zinc-600">
                  Works at{" "}
                  {coach.gym_slug ? (
                    <Link
                      href={`/gyms/${coach.gym_slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium underline"
                    >
                      {coach.gym_name}
                    </Link>
                  ) : (
                    <span className="font-medium">{coach.gym_name}</span>
                  )}
                </p>
              )}

              <p className="mt-2 font-semibold">
                {coach.price_per_session
                  ? `${coach.price_per_session} $ / session`
                  : "Contact for price"}
              </p>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openRequestForm(coach);
                }}
                className="mt-4 w-full rounded-lg bg-black py-2 text-white transition hover:bg-zinc-800"
              >
                Request Coaching
              </button>
            </div>
          </Link>
        ))}
      </div>

      {selectedCoach && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 p-4"
          onClick={closeRequestForm}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-semibold">
              Request Coaching - {selectedCoach.full_name}
            </h2>

            <input
              type="text"
              placeholder="Your goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="mt-4 w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
            />

            <textarea
              placeholder="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-4 w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={closeRequestForm}
                className="w-full rounded-lg border py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSendRequest}
                disabled={submitting}
                className="w-full rounded-lg bg-black py-2 text-white transition hover:bg-zinc-800 disabled:opacity-70"
              >
                {submitting ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}