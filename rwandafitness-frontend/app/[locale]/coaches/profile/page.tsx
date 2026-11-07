"use client";

import {ChangeEvent, FormEvent, useEffect, useRef, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {useRouter} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Gym = {id: number; name: string};
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
  photo_url?: string | null;
  photo?: string | null;
  full_name?: string | null;
};
type PaginatedGymResponse = {results?: Gym[]};

const initialForm: FormState = {
  bio: "", specialty: "fitness", years_experience: "", city: "",
  price_per_session: "", available_online: false,
  available_in_person: true, instagram: "", gym: "", photo: null,
};

const fieldClass = "mt-2 w-full rounded-2xl border border-[#dbe9e0] bg-[#fbfdfb] px-4 py-3.5 text-sm text-[#173d2a] shadow-sm outline-none transition placeholder:text-[#8ba599] focus:border-[#00a873] focus:bg-white focus:ring-4 focus:ring-[#00cfff]/15";
const labelClass = "block text-sm font-bold text-[#183c2a]";

function SectionIcon({kind}: {kind: "profile" | "work" | "availability" | "photo"}) {
  const common = {width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const};
  if (kind === "profile") return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
  if (kind === "work") return <svg {...common}><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/></svg>;
  if (kind === "availability") return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18m-13 5 3 3 5-5"/></svg>;
  return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 16-5-5L5 20"/></svg>;
}

export default function CoachProfileEditPage() {
  const locale = useLocale();
  const t = useTranslations("CoachProfileEdit");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"success" | "error">("error");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return () => controller.abort();
    }
    const loadProfile = async () => {
      try {
        setLoading(true);
        setMessage("");
        const [profileResponse, gymsResponse] = await Promise.all([
          fetch(`${API_URL}/api/coaches/me/?lang=${locale}`, {
            headers: {Authorization: `Token ${token}`}, signal: controller.signal, cache: "no-store",
          }),
          fetch(`${API_URL}/api/gyms/?lang=${locale}`, {
            headers: {Authorization: `Token ${token}`}, signal: controller.signal, cache: "no-store",
          }),
        ]);
        if (profileResponse.status === 401 || profileResponse.status === 403) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }
        if (!profileResponse.ok) throw new Error("Failed to load profile");
        const profile: CoachProfileResponse = await profileResponse.json();
        let gymsData: Gym[] | PaginatedGymResponse = [];
        if (gymsResponse.ok) gymsData = await gymsResponse.json();
        if (controller.signal.aborted) return;
        setForm({
          bio: profile.bio || "", specialty: profile.specialty || "fitness",
          years_experience: profile.years_experience != null ? String(profile.years_experience) : "",
          city: profile.city || "",
          price_per_session: profile.price_per_session != null ? String(profile.price_per_session) : "",
          available_online: Boolean(profile.available_online),
          available_in_person: Boolean(profile.available_in_person),
          instagram: profile.instagram || "", gym: profile.gym != null ? String(profile.gym) : "",
          photo: null,
        });
        setCurrentPhoto(profile.photo_url || profile.photo || null);
        setProfileName(profile.full_name || "");
        setGyms(Array.isArray(gymsData) ? gymsData : gymsData.results ?? []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setMessageKind("error");
          setMessage(t("messages.loadFailed"));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadProfile();
    return () => controller.abort();
  }, [locale, router, t]);

  useEffect(() => {
    if (!form.photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(form.photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.photo]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target;
    const name = target.name;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm(current => ({...current, [name]: target.checked}));
      return;
    }
    if (target instanceof HTMLInputElement && target.type === "file") {
      setForm(current => ({...current, photo: target.files?.[0] || null}));
      return;
    }
    setForm(current => ({...current, [name]: target.value}));
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
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
      formData.append("years_experience", form.years_experience || "0");
      formData.append("city", form.city);
      formData.append("available_online", String(form.available_online));
      formData.append("available_in_person", String(form.available_in_person));
      formData.append("instagram", form.instagram);
      if (form.price_per_session) formData.append("price_per_session", form.price_per_session);
      if (form.gym) formData.append("gym", form.gym);
      if (form.photo) formData.append("photo", form.photo);
      const response = await fetch(`${API_URL}/api/coaches/me/?lang=${locale}`, {
        method: "PATCH", headers: {Authorization: `Token ${token}`}, body: formData,
      });
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Coach profile update failed:", errorData);
        throw new Error("Failed to save profile");
      }
      if (form.photo) {
        const updated: CoachProfileResponse | null = await response.json().catch(() => null);
        setCurrentPhoto(updated?.photo_url || updated?.photo || currentPhoto);
      }
      setForm(current => ({...current, photo: null}));
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessageKind("success");
      setMessage(t("messages.saveSuccess"));
      window.scrollTo({top: 0, behavior: "smooth"});
    } catch {
      setMessageKind("error");
      setMessage(t("messages.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <main className="min-h-screen bg-[#f3faf6] px-4 py-10 sm:px-6" aria-busy="true">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-52 rounded-[32px] bg-[#dcefe3]" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-80 rounded-[28px] bg-white lg:col-span-2" />
          <div className="h-80 rounded-[28px] bg-white" />
        </div>
        <p className="text-sm text-[#567564]">{t("loading")}</p>
      </div>
    </main>
  );

  const sectionHeader = (kind: "profile" | "work" | "availability" | "photo", title: string, description?: string) => (
    <div className="mb-7 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f8ef] text-[#075c38] ring-1 ring-[#d1efdc]">
        <SectionIcon kind={kind} />
      </div>
      <div>
        <h2 className="text-xl font-black tracking-tight text-[#123b28] sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-[#668071]">{description}</p>}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f3faf6] pb-16 text-[#173d2a]">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 sm:pt-10">
        <header className="relative overflow-hidden rounded-[30px] bg-[#075c38] px-6 py-9 text-white shadow-[0_20px_55px_rgba(7,92,56,0.16)] sm:px-10 sm:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[50px] border-[#00cfff]/20" />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[-100px] right-24 h-56 w-56 rounded-full bg-[#00cfff]/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#c4f7e0]">
              <span className="h-2 w-2 rounded-full bg-[#ffd21a]" /> RwandaFitness · Coach
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{t("title")}</h1>
            <div className="mt-5 h-1 w-16 rounded-full bg-[#ffd21a]" />
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
              {locale === "rw" ? "Tunganya amakuru yawe kugira ngo abakiriya bakumenye neza." : "Make your profile stand out and help clients discover your coaching expertise."}
            </p>
          </div>
        </header>

        {message && (
          <div role="status" className={`mt-6 rounded-2xl border px-5 py-4 text-sm font-semibold ${messageKind === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#e1eee6] bg-white p-5 shadow-[0_10px_35px_rgba(8,72,43,0.045)] sm:p-8">
              {sectionHeader("profile", t("fields.bio.label"))}
              <label htmlFor="bio" className={labelClass}>{t("fields.bio.label")}</label>
              <textarea id="bio" name="bio" placeholder={t("fields.bio.placeholder")} value={form.bio} onChange={handleChange} rows={6} className={`${fieldClass} resize-y leading-7`} />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="specialty" className={labelClass}>{t("fields.specialty.label")}</label>
                  <select id="specialty" name="specialty" value={form.specialty} onChange={handleChange} className={fieldClass}>
                    <option value="fitness">{t("specialties.fitness")}</option>
                    <option value="bodybuilding">{t("specialties.bodybuilding")}</option>
                    <option value="weight_loss">{t("specialties.weightLoss")}</option>
                    <option value="crossfit">{t("specialties.crossfit")}</option>
                    <option value="yoga">{t("specialties.yoga")}</option>
                    <option value="cardio">{t("specialties.cardio")}</option>
                    <option value="nutrition">{t("specialties.nutrition")}</option>
                    <option value="other">{t("specialties.other")}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="years_experience" className={labelClass}>{t("fields.yearsExperience.label")}</label>
                  <input id="years_experience" type="number" min="0" name="years_experience" placeholder={t("fields.yearsExperience.placeholder")} value={form.years_experience} onChange={handleChange} className={fieldClass} />
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#e1eee6] bg-white p-5 shadow-[0_10px_35px_rgba(8,72,43,0.045)] sm:p-8">
              {sectionHeader("work", locale === "rw" ? "Amakuru y'akazi" : "Professional details")}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="city" className={labelClass}>{t("fields.city.label")}</label>
                  <input id="city" type="text" name="city" placeholder={t("fields.city.placeholder")} value={form.city} onChange={handleChange} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="price_per_session" className={labelClass}>{t("fields.price.label")}</label>
                  <input id="price_per_session" type="number" min="0" step="0.01" name="price_per_session" placeholder={t("fields.price.placeholder")} value={form.price_per_session} onChange={handleChange} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="gym" className={labelClass}>{t("fields.gym.label")}</label>
                  <select id="gym" name="gym" value={form.gym} onChange={handleChange} className={fieldClass}>
                    <option value="">{t("fields.gym.noGym")}</option>
                    {gyms.map(gym => <option key={gym.id} value={gym.id}>{gym.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="instagram" className={labelClass}>{t("fields.instagram.label")}</label>
                  <input id="instagram" type="url" name="instagram" placeholder={t("fields.instagram.placeholder")} value={form.instagram} onChange={handleChange} className={fieldClass} />
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-[#e1eee6] bg-white p-5 shadow-[0_10px_35px_rgba(8,72,43,0.045)] sm:p-8">
              {sectionHeader("availability", locale === "rw" ? "Uko uboneka" : "Training availability")}
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  {name: "available_online" as const, label: t("fields.availableOnline"), icon: "⌁"},
                  {name: "available_in_person" as const, label: t("fields.availableInPerson"), icon: "⌖"},
                ]).map(item => (
                  <label key={item.name} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${form[item.name] ? "border-[#8bd5ae] bg-[#effaf3]" : "border-[#e1eee6] bg-[#fbfdfb] hover:border-[#a6d6bc]"}`}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-2xl text-[#075c38] shadow-sm">{item.icon}</span>
                    <span className="min-w-0 flex-1 text-sm font-bold text-[#214734]">{item.label}</span>
                    <input type="checkbox" name={item.name} checked={form[item.name]} onChange={handleChange} className="h-5 w-5 shrink-0 accent-[#075c38]" />
                  </label>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <section className="rounded-[28px] border border-[#e1eee6] bg-white p-5 shadow-[0_10px_35px_rgba(8,72,43,0.045)] sm:p-6">
              {sectionHeader("photo", t("fields.photo.label"))}
              <div className="relative mx-auto aspect-square max-w-[230px] overflow-hidden rounded-[28px] border-4 border-white bg-gradient-to-br from-[#075c38] via-[#087d51] to-[#00cfff] shadow-[0_15px_35px_rgba(7,92,56,0.15)]">
                {(photoPreview || currentPhoto) ? (
                  // The API can return absolute media URLs; a native img supports them without Next image domain config.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview || currentPhoto || ""} alt={profileName || t("fields.photo.label")} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-7xl font-black text-white/90">{profileName.trim().charAt(0).toUpperCase() || "RF"}</div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#003d24]/40 to-transparent" />
              </div>
              {profileName && <p className="mt-4 text-center text-base font-black text-[#123b28]">{profileName}</p>}
              <label htmlFor="photo" className="mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#cde6d6] bg-[#f3faf6] px-4 py-3 text-sm font-bold text-[#075c38] transition hover:border-[#075c38] hover:bg-[#e9f7ee]">
                <SectionIcon kind="photo" /> {t("fields.photo.label")}
              </label>
              <input ref={fileInputRef} id="photo" type="file" name="photo" accept="image/*" onChange={handleChange} className="sr-only" />
              {form.photo && <p className="mt-3 break-all text-center text-xs text-[#587764]">{t("fields.photo.selected", {name: form.photo.name})}</p>}
            </section>

            <section className="overflow-hidden rounded-[28px] bg-[#075c38] p-6 text-white shadow-[0_16px_40px_rgba(7,92,56,0.16)]">
              <div className="mb-4 h-1 w-12 rounded-full bg-[#ffd21a]" />
              <p className="text-sm leading-6 text-white/75">{locale === "rw" ? "Bika impinduka kugira ngo umwirondoro wawe uvugururwe." : "Save your changes to keep your coaching profile up to date."}</p>
              <button type="submit" disabled={saving} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffd21a] px-5 py-4 text-sm font-black text-[#123b28] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#ffe05a] disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? t("saving") : t("save")}
                {!saving && <span aria-hidden="true">→</span>}
              </button>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}
