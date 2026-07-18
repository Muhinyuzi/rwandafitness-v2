"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type Gym = {
  id: number;
  name: string;
};

type FormState = {
  bio: string;
  specialty: string;
  years_experience: string;
  city: string;
  price_per_session: string;
  available_online: boolean;
  available_in_person: boolean;
  instagram: string;
  gym: string;
  photo: File | null;
};

export default function CoachProfileEditPage() {
  const [form, setForm] = useState<FormState>({
    bio: "",
    specialty: "fitness",
    years_experience: "",
    city: "",
    price_per_session: "",
    available_online: false,
    available_in_person: true,
    instagram: "",
    gym: "",
    photo: null,
  });

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    Promise.all([
      fetch(`${API_URL}/api/coaches/me/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      }),
      fetch(`${API_URL}/api/gyms/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      }),
    ])
      .then(async ([profileRes, gymsRes]) => {
        if (!profileRes.ok) {
          throw new Error("Failed to load profile.");
        }

        const profile = await profileRes.json();
        const gymsData = gymsRes.ok ? await gymsRes.json() : [];

        setForm({
          bio: profile.bio || "",
          specialty: profile.specialty || "fitness",
          years_experience: profile.years_experience?.toString() || "",
          city: profile.city || "",
          price_per_session: profile.price_per_session || "",
          available_online: !!profile.available_online,
          available_in_person: !!profile.available_in_person,
          instagram: profile.instagram || "",
          gym: profile.gym ? String(profile.gym) : "",
          photo: null,
        });

        setGyms(Array.isArray(gymsData) ? gymsData : gymsData.results ?? []);
      })
      .catch(() => setMessage("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const name = target.name;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
      return;
    }

    if (target instanceof HTMLInputElement && target.type === "file") {
      setForm((prev) => ({
        ...prev,
        photo: target.files?.[0] || null,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: target.value,
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const formData = new FormData();
      formData.append("bio", form.bio);
      formData.append("specialty", form.specialty);
      formData.append("years_experience", form.years_experience || "0");
      formData.append("city", form.city);
      formData.append("price_per_session", form.price_per_session || "");
      formData.append("available_online", String(form.available_online));
      formData.append("available_in_person", String(form.available_in_person));
      formData.append("instagram", form.instagram);
      formData.append("gym", form.gym || "");

      if (form.photo) {
        formData.append("photo", form.photo);
      }

      const res = await fetch(`${API_URL}/api/coaches/me/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.text();
        throw new Error(data || "Failed to save profile.");
      }

      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-6 py-10">Loading profile...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-zinc-900">Edit Coach Profile</h1>

      {message && (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          {message}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          <textarea
            name="bio"
            placeholder="Bio"
            value={form.bio}
            onChange={handleChange}
            rows={5}
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <select
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="fitness">Fitness</option>
            <option value="bodybuilding">Bodybuilding</option>
            <option value="weight_loss">Weight Loss</option>
            <option value="crossfit">CrossFit</option>
            <option value="yoga">Yoga</option>
            <option value="cardio">Cardio</option>
            <option value="nutrition">Nutrition</option>
            <option value="other">Other</option>
          </select>

          <input
            type="number"
            name="years_experience"
            placeholder="Years of experience"
            value={form.years_experience}
            onChange={handleChange}
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <input
            type="number"
            step="0.01"
            name="price_per_session"
            placeholder="Price per session"
            value={form.price_per_session}
            onChange={handleChange}
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <input
            type="url"
            name="instagram"
            placeholder="Instagram URL"
            value={form.instagram}
            onChange={handleChange}
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <select
            name="gym"
            value={form.gym}
            onChange={handleChange}
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="">No gym</option>
            {gyms.map((gym) => (
              <option key={gym.id} value={gym.id}>
                {gym.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              name="available_online"
              checked={form.available_online}
              onChange={handleChange}
            />
            Available online
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              name="available_in_person"
              checked={form.available_in_person}
              onChange={handleChange}
            />
            Available in person
          </label>

          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleChange}
            className="rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}