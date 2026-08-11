"use client";

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";
import {
  useLocale,
  useTranslations,
} from "next-intl";

import {useRouter} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

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

type CoachProfileResponse = {
  bio?: string | null;
  specialty?: string | null;
  years_experience?: number | null;
  city?: string | null;
  price_per_session?: string | number | null;
  available_online?: boolean;
  available_in_person?: boolean;
  instagram?: string | null;
  gym?: number | null;
};

type PaginatedGymResponse = {
  results?: Gym[];
};

export default function CoachProfileEditPage() {
  const locale = useLocale();
  const t = useTranslations("CoachProfileEdit");
  const router = useRouter();

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
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");

      return () => {
        controller.abort();
      };
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setMessage("");

        const [profileResponse, gymsResponse] = await Promise.all([
          fetch(
            `${API_URL}/api/coaches/me/?lang=${locale}`,
            {
              headers: {
                Authorization: `Token ${token}`,
              },
              signal: controller.signal,
              cache: "no-store",
            },
          ),
          fetch(
            `${API_URL}/api/gyms/?lang=${locale}`,
            {
              headers: {
                Authorization: `Token ${token}`,
              },
              signal: controller.signal,
              cache: "no-store",
            },
          ),
        ]);

        if (
          profileResponse.status === 401 ||
          profileResponse.status === 403
        ) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        if (!profileResponse.ok) {
          throw new Error("Failed to load profile");
        }

        const profile: CoachProfileResponse =
          await profileResponse.json();

        let gymsData: Gym[] | PaginatedGymResponse = [];

        if (gymsResponse.ok) {
          gymsData = await gymsResponse.json();
        }

        setForm({
          bio: profile.bio || "",
          specialty: profile.specialty || "fitness",
          years_experience:
            profile.years_experience !== null &&
            profile.years_experience !== undefined
              ? String(profile.years_experience)
              : "",
          city: profile.city || "",
          price_per_session:
            profile.price_per_session !== null &&
            profile.price_per_session !== undefined
              ? String(profile.price_per_session)
              : "",
          available_online: Boolean(
            profile.available_online,
          ),
          available_in_person: Boolean(
            profile.available_in_person,
          ),
          instagram: profile.instagram || "",
          gym:
            profile.gym !== null &&
            profile.gym !== undefined
              ? String(profile.gym)
              : "",
          photo: null,
        });

        if (Array.isArray(gymsData)) {
          setGyms(gymsData);
        } else {
          setGyms(gymsData.results ?? []);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setMessage(t("messages.loadFailed"));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      controller.abort();
    };
  }, [locale, router, t]);

  const handleChange = (
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >,
  ) => {
    const target = event.target;
    const name = target.name;

    if (
      target instanceof HTMLInputElement &&
      target.type === "checkbox"
    ) {
      setForm((current) => ({
        ...current,
        [name]: target.checked,
      }));

      return;
    }

    if (
      target instanceof HTMLInputElement &&
      target.type === "file"
    ) {
      setForm((current) => ({
        ...current,
        photo: target.files?.[0] || null,
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]: target.value,
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const formData = new FormData();

      formData.append("bio", form.bio);
      formData.append("specialty", form.specialty);
      formData.append(
        "years_experience",
        form.years_experience || "0",
      );
      formData.append("city", form.city);
      formData.append(
        "available_online",
        String(form.available_online),
      );
      formData.append(
        "available_in_person",
        String(form.available_in_person),
      );
      formData.append("instagram", form.instagram);

      if (form.price_per_session) {
        formData.append(
          "price_per_session",
          form.price_per_session,
        );
      }

      if (form.gym) {
        formData.append("gym", form.gym);
      }

      if (form.photo) {
        formData.append("photo", form.photo);
      }

      const response = await fetch(
        `${API_URL}/api/coaches/me/?lang=${locale}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        },
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        console.error(
          "Coach profile update failed:",
          errorData,
        );

        throw new Error("Failed to save profile");
      }

      setForm((current) => ({
        ...current,
        photo: null,
      }));

      setMessage(t("messages.saveSuccess"));
    } catch {
      setMessage(t("messages.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 text-sm text-zinc-600">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-zinc-900">
        {t("title")}
      </h1>

      {message && (
        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          {message}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          <div>
            <label
              htmlFor="bio"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              {t("fields.bio.label")}
            </label>

            <textarea
              id="bio"
              name="bio"
              placeholder={t("fields.bio.placeholder")}
              value={form.bio}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="specialty"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              {t("fields.specialty.label")}
            </label>

            <select
              id="specialty"
              name="specialty"
              value={form.specialty}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="fitness">
                {t("specialties.fitness")}
              </option>

              <option value="bodybuilding">
                {t("specialties.bodybuilding")}
              </option>

              <option value="weight_loss">
                {t("specialties.weightLoss")}
              </option>

              <option value="crossfit">
                {t("specialties.crossfit")}
              </option>

              <option value="yoga">
                {t("specialties.yoga")}
              </option>

              <option value="cardio">
                {t("specialties.cardio")}
              </option>

              <option value="nutrition">
                {t("specialties.nutrition")}
              </option>

              <option value="other">
                {t("specialties.other")}
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="years_experience"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              {t("fields.yearsExperience.label")}
            </label>

            <input
              id="years_experience"
              type="number"
              min="0"
              name="years_experience"
              placeholder={t(
                "fields.yearsExperience.placeholder",
              )}
              value={form.years_experience}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              {t("fields.city.label")}
            </label>

            <input
              id="city"
              type="text"
              name="city"
              placeholder={t("fields.city.placeholder")}
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="price_per_session"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              {t("fields.price.label")}
            </label>

            <input
              id="price_per_session"
              type="number"
              min="0"
              step="0.01"
              name="price_per_session"
              placeholder={t("fields.price.placeholder")}
              value={form.price_per_session}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="instagram"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              {t("fields.instagram.label")}
            </label>

            <input
              id="instagram"
              type="url"
              name="instagram"
              placeholder={t(
                "fields.instagram.placeholder",
              )}
              value={form.instagram}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="gym"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              {t("fields.gym.label")}
            </label>

            <select
              id="gym"
              name="gym"
              value={form.gym}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="">
                {t("fields.gym.noGym")}
              </option>

              {gyms.map((gym) => (
                <option key={gym.id} value={gym.id}>
                  {gym.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 rounded-xl bg-zinc-50 p-4">
            <label className="flex items-center gap-3 text-sm text-zinc-700">
              <input
                type="checkbox"
                name="available_online"
                checked={form.available_online}
                onChange={handleChange}
              />

              {t("fields.availableOnline")}
            </label>

            <label className="flex items-center gap-3 text-sm text-zinc-700">
              <input
                type="checkbox"
                name="available_in_person"
                checked={form.available_in_person}
                onChange={handleChange}
              />

              {t("fields.availableInPerson")}
            </label>
          </div>

          <div>
            <label
              htmlFor="photo"
              className="mb-2 block text-sm font-medium text-zinc-700"
            >
              {t("fields.photo.label")}
            </label>

            <input
              id="photo"
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
            />

            {form.photo && (
              <p className="mt-2 text-xs text-zinc-500">
                {t("fields.photo.selected", {
                  name: form.photo.name,
                })}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}