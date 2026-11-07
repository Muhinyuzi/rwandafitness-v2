"use client";

import {useEffect, useMemo, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Link, useRouter} from "@/i18n/navigation";
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

type PaginatedCoachResponse = {results?: Coach[]};

export default function CoachesPage() {
  const locale = useLocale();
  const t = useTranslations("Coaches");
  const router = useRouter();
  const rw = locale === "rw";
  const ui = rw
    ? {
        eyebrow: "RWANDAFITNESS · ABAHUGURA",
        intro: "Shakisha umutoza ugufasha kugera ku ntego zawe. Reba ubuhanga bwe, aho akorera, maze umwandikire.",
        search: "Shakisha umutoza, umwihariko cyangwa umujyi...",
        specialty: "Imyitozo yose",
        city: "Imijyi yose",
        verified: "Abemejwe gusa",
        results: "Abatoza babonetse",
        reset: "Siba amahitamo",
        noResults: "Nta mutoza uhuye n'ibyo washakishije.",
        browse: "Reba umwirondoro",
        discover: "Hitamo umutoza ukubereye",
        directory: "Abatoza baboneka",
        all: "Bose",
        loading: "Turimo gushaka abatoza...",
        close: "Funga",
      }
    : {
        eyebrow: "RWANDAFITNESS · COACHING",
        intro: "Find the right coach for your goals. Explore their expertise, location and gym, then reach out directly.",
        search: "Search by coach, specialty or city...",
        specialty: "All specialties",
        city: "All cities",
        verified: "Verified only",
        results: "Coaches found",
        reset: "Clear filters",
        noResults: "No coaches match your search.",
        browse: "View profile",
        discover: "Find your perfect coach",
        directory: "Explore our coaches",
        all: "All",
        loading: "Loading coaches...",
        close: "Close",
      };

  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCoaches() {
      try {
        setLoading(true);
        setStatusMessage("");
        const response = await fetch(`${API_URL}/api/coaches/?lang=${locale}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to load coaches");
        const data: Coach[] | PaginatedCoachResponse = await response.json();
        if (!controller.signal.aborted) {
          setCoaches(Array.isArray(data) ? data : (data.results ?? []));
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setCoaches([]);
          setStatusMessage(t("messages.loadFailed"));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadCoaches();
    return () => controller.abort();
  }, [locale, t]);

  useEffect(() => {
    if (!selectedCoach) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !submitting) setSelectedCoach(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCoach, submitting]);

  const specialties = useMemo(() => Array.from(new Set(coaches.map(c => c.specialty_display || c.specialty).filter(Boolean))).sort(), [coaches]);
  const cities = useMemo(() => Array.from(new Set(coaches.map(c => c.city).filter(Boolean))).sort(), [coaches]);
  const filteredCoaches = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    return coaches.filter(coach => {
      const specialty = coach.specialty_display || coach.specialty;
      const matchesSearch = !q || [coach.full_name, specialty, coach.city, coach.gym_name || ""].some(value => value.toLocaleLowerCase().includes(q));
      return matchesSearch && (!specialtyFilter || specialty === specialtyFilter) && (!cityFilter || coach.city === cityFilter) && (!verifiedOnly || coach.is_verified);
    });
  }, [coaches, search, specialtyFilter, cityFilter, verifiedOnly]);

  const hasFilters = Boolean(search || specialtyFilter || cityFilter || verifiedOnly);
  function resetFilters() {
    setSearch("");
    setSpecialtyFilter("");
    setCityFilter("");
    setVerifiedOnly(false);
  }

  function openRequestForm(coach: Coach) {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setSelectedCoach(coach);
    setGoal("");
    setMessage("");
    setStatusMessage("");
  }

  function closeRequestForm() {
    if (submitting) return;
    setSelectedCoach(null);
    setGoal("");
    setMessage("");
  }

  function formatApiError(data: unknown): string {
    if (!data || typeof data !== "object") return t("messages.requestFailed");
    const entry = Object.entries(data as Record<string, unknown>)[0];
    if (!entry) return t("messages.requestFailed");
    const value = entry[1];
    if (Array.isArray(value)) return value.join(" ");
    if (typeof value === "string") return value;
    return t("messages.requestFailed");
  }

  async function handleSendRequest() {
    if (submitting) return;
    const token = localStorage.getItem("token");
    if (!token) {
      closeRequestForm();
      router.push("/login");
      return;
    }
    if (!selectedCoach) return;
    if (!goal.trim()) {
      setStatusMessage(t("messages.goalRequired"));
      return;
    }
    try {
      setSubmitting(true);
      setStatusMessage("");
      const response = await fetch(`${API_URL}/api/requests/create/`, {
        method: "POST",
        headers: {"Content-Type": "application/json", Authorization: `Token ${token}`},
        body: JSON.stringify({coach: selectedCoach.id, goal: goal.trim(), message: message.trim()}),
      });
      let data: unknown = null;
      try { data = await response.json(); } catch { data = null; }
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        setSelectedCoach(null);
        router.push("/login");
        return;
      }
      if (!response.ok) {
        setStatusMessage(formatApiError(data));
        return;
      }
      setSelectedCoach(null);
      setGoal("");
      setMessage("");
      setStatusMessage(t("messages.requestSent"));
    } catch {
      setStatusMessage(t("messages.requestFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F3FAF6] text-[#17251E]">
      {/* Editorial hero */}
      <section className="relative isolate overflow-hidden rounded-[30px] bg-[#075C38] text-white shadow-[0_20px_60px_rgba(0,61,36,0.14)] sm:rounded-[38px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(0,207,255,0.22),transparent_35%),radial-gradient(circle_at_8%_90%,rgba(255,210,26,0.12),transparent_35%),linear-gradient(120deg,#003D24,#075C38_60%,#007D36)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full border border-white/15" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-20 h-72 w-72 rounded-full border border-[#00CFFF]/30" />
        <div className="relative grid gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-14 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#00CFFF] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#FFD21A]" />{ui.eyebrow}
            </div>
            <h1 className="mt-7 max-w-2xl font-serif text-4xl font-bold italic leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">{t("title")}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">{ui.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFD21A] px-4 py-2 text-sm font-extrabold text-[#003D24]">
                <span aria-hidden="true">✦</span> {loading ? "…" : coaches.length} {coaches.length === 1 ? "coach" : "coaches"}
              </span>
              <span className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white/85">RwandaFitness</span>
            </div>
          </div>
          <div className="relative hidden min-h-[260px] items-center justify-center lg:flex" aria-hidden="true">
            <div className="absolute h-64 w-64 rounded-full border border-[#00CFFF]/25" />
            <div className="absolute h-48 w-48 rounded-full border border-white/20" />
            <div className="relative flex h-36 w-36 rotate-[-10deg] items-center justify-center rounded-[38px] border border-white/30 bg-white/10 text-7xl shadow-2xl backdrop-blur-md">💪</div>
            <span className="absolute right-4 top-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-serif text-lg font-bold italic text-[#FFD21A] backdrop-blur-md">Stronger</span>
            <span className="absolute bottom-4 left-1 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-serif text-lg font-bold italic text-[#00CFFF] backdrop-blur-md">Better life</span>
          </div>
        </div>
      </section>

      {/* Search and filter panel */}
      <section className="relative z-10 mx-auto -mt-5 max-w-6xl px-3 sm:px-6">
        <div className="rounded-[26px] border border-[#007D36]/10 bg-white p-4 shadow-[0_16px_45px_rgba(0,61,36,0.10)] sm:p-6">
          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
            <label className="relative block">
              <span className="sr-only">{ui.search}</span>
              <span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#007D36]">⌕</span>
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder={ui.search} className="w-full rounded-2xl border border-[#007D36]/15 bg-[#F3FAF6] py-3.5 pl-11 pr-4 text-sm text-[#17251E] outline-none transition placeholder:text-[#64776A] focus:border-[#007D36] focus:ring-4 focus:ring-[#007D36]/10" />
            </label>
            <label className="block">
              <span className="sr-only">{ui.specialty}</span>
              <select value={specialtyFilter} onChange={event => setSpecialtyFilter(event.target.value)} className="w-full rounded-2xl border border-[#007D36]/15 bg-[#F3FAF6] px-4 py-3.5 text-sm text-[#17251E] outline-none focus:border-[#007D36] focus:ring-4 focus:ring-[#007D36]/10">
                <option value="">{ui.specialty}</option>
                {specialties.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="sr-only">{ui.city}</span>
              <select value={cityFilter} onChange={event => setCityFilter(event.target.value)} className="w-full rounded-2xl border border-[#007D36]/15 bg-[#F3FAF6] px-4 py-3.5 text-sm text-[#17251E] outline-none focus:border-[#007D36] focus:ring-4 focus:ring-[#007D36]/10">
                <option value="">{ui.city}</option>
                {cities.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#007D36]/10 pt-4">
            <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-semibold text-[#335544]">
              <input type="checkbox" checked={verifiedOnly} onChange={event => setVerifiedOnly(event.target.checked)} className="h-4 w-4 accent-[#007D36]" />
              <span className="inline-flex items-center gap-2"><span className="text-[#007D36]">✓</span>{ui.verified}</span>
            </label>
            {hasFilters && <button type="button" onClick={resetFilters} className="text-sm font-bold text-[#007D36] underline decoration-[#00CFFF] underline-offset-4 hover:text-[#003D24]">{ui.reset}</button>}
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="mx-auto max-w-7xl px-3 pb-16 pt-12 sm:px-6 lg:pt-16">
        {statusMessage && !selectedCoach && <div role="status" className="mb-7 rounded-2xl border border-[#007D36]/20 bg-white px-5 py-4 text-sm font-semibold text-[#075C38] shadow-sm">{statusMessage}</div>}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#007D36]">{ui.directory}</p>
            <h2 className="mt-2 font-serif text-3xl font-bold italic tracking-tight text-[#003D24] sm:text-4xl">{ui.discover}</h2>
          </div>
          {!loading && <span className="rounded-full border border-[#007D36]/15 bg-white px-4 py-2 text-sm font-bold text-[#075C38]">{filteredCoaches.length} {ui.results}</span>}
        </div>

        {loading ? (
          <div role="status" aria-label={ui.loading} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({length: 6}, (_, index) => (
              <div key={index} className="overflow-hidden rounded-[28px] border border-[#007D36]/10 bg-white shadow-sm">
                <div className="aspect-[5/4] animate-pulse bg-[#DDEFE5]" />
                <div className="space-y-4 p-6"><div className="h-6 w-2/3 animate-pulse rounded bg-[#DDEFE5]" /><div className="h-4 w-1/2 animate-pulse rounded bg-[#EAF5EE]" /><div className="h-12 animate-pulse rounded-xl bg-[#EAF5EE]" /></div>
              </div>
            ))}
          </div>
        ) : filteredCoaches.length === 0 ? (
          <div className="rounded-[30px] border border-[#007D36]/10 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F3FAF6] text-3xl">⌕</div>
            <p className="mt-5 text-lg font-bold text-[#003D24]">{coaches.length === 0 ? (statusMessage || t("empty")) : ui.noResults}</p>
            {hasFilters && <button type="button" onClick={resetFilters} className="mt-5 rounded-xl bg-[#FFD21A] px-6 py-3 text-sm font-bold text-[#003D24] hover:bg-[#FFE15C]">{ui.reset}</button>}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCoaches.map(coach => {
              const specialty = coach.specialty_display || coach.specialty;
              const photo = coach.photo_url || coach.photo;
              return (
                <article key={coach.id} className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#007D36]/10 bg-white shadow-[0_8px_28px_rgba(0,61,36,0.06)] ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00CFFF]/40 hover:shadow-[0_22px_55px_rgba(0,61,36,0.14)] hover:ring-[#00CFFF]/25">
                  <Link href={`/coaches/${coach.id}`} className="block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#00CFFF]">
                    <div className="relative aspect-[5/4] overflow-hidden bg-[#DDEFE5]">
                      {photo ? <img src={photo} alt={coach.full_name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#075C38] via-[#007D36] to-[#00A67A]">
                          <span className="font-serif text-8xl font-bold italic text-white/85">{coach.full_name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#003D24]/70 via-[#003D24]/15 to-transparent" />
                      {coach.is_verified && <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/95 px-3 py-2 text-xs font-extrabold text-[#075C38] shadow-sm backdrop-blur"><span className="text-[#007D36]">✓</span>{t("verified")}</span>}
                      <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-[#003D24]/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">⌖ {coach.city}</span>
                      <span aria-hidden="true" className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD21A] text-xl font-bold text-[#003D24] shadow-lg transition-transform group-hover:translate-x-1">→</span>
                    </div>
                    <div className="px-6 pt-6">
                      <h3 className="font-serif text-2xl font-bold italic leading-tight text-[#003D24] transition-colors group-hover:text-[#007D36]">{coach.full_name}</h3>
                      <span className="mt-3 inline-flex max-w-full rounded-full bg-[#EAF7EF] px-3 py-1.5 text-xs font-bold text-[#007D36]">{specialty}</span>
                      {coach.gym_name && <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#F3FAF6] px-4 py-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg">🏋️</span><div className="min-w-0"><p className="text-[11px] font-medium text-[#64776A]">{t("worksAt")}</p><p className="truncate text-sm font-bold text-[#003D24]">{coach.gym_name}</p></div></div>}
                      <div className="mt-5 flex min-h-12 items-center justify-between gap-3 border-t border-[#007D36]/10 py-4">
                        <p className="text-xs font-semibold leading-5 text-[#52665B]">{coach.price_per_session ? t("pricePerSession", {price: coach.price_per_session}) : t("contactForPrice")}</p>
                        <span className="shrink-0 text-xs font-extrabold text-[#007D36]">{ui.browse} →</span>
                      </div>
                    </div>
                  </Link>
                  <div className="mt-auto px-6 pb-6">
                    <button type="button" onClick={() => openRequestForm(coach)} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#075C38] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,61,36,0.16)] transition hover:-translate-y-0.5 hover:bg-[#007D36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00CFFF] active:translate-y-0">
                      {t("requestCoaching")} <span aria-hidden="true" className="text-[#FFD21A]">→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Request modal — API and auth behavior preserved */}
      {selectedCoach && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#001D11]/70 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={event => {if (event.target === event.currentTarget) closeRequestForm();}}>
          <div role="dialog" aria-modal="true" aria-labelledby="coaching-request-title" className="max-h-[94vh] w-full overflow-y-auto rounded-t-[30px] bg-white shadow-2xl sm:max-w-xl sm:rounded-[30px]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#003D24] via-[#075C38] to-[#007D36] px-6 py-7 text-white sm:px-8">
              <div aria-hidden="true" className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/20" />
              <div className="relative flex items-start gap-4">
                {(selectedCoach.photo_url || selectedCoach.photo) ? <img src={selectedCoach.photo_url || selectedCoach.photo || ""} alt={selectedCoach.full_name} className="h-16 w-16 shrink-0 rounded-2xl border-2 border-white/40 object-cover sm:h-20 sm:w-20" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 font-serif text-3xl font-bold italic text-white sm:h-20 sm:w-20">{selectedCoach.full_name.charAt(0).toUpperCase()}</div>}
                <div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wider text-[#00CFFF]">{selectedCoach.specialty_display || selectedCoach.specialty}</p><h2 id="coaching-request-title" className="mt-2 font-serif text-xl font-bold italic leading-tight sm:text-2xl">{t("form.title", {name: selectedCoach.full_name})}</h2><p className="mt-2 text-sm text-white/75">⌖ {selectedCoach.city}</p></div>
                <button type="button" onClick={closeRequestForm} disabled={submitting} aria-label={ui.close} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xl text-white transition hover:bg-white/25 disabled:opacity-50">×</button>
              </div>
            </div>
            <form onSubmit={event => {event.preventDefault(); void handleSendRequest();}} className="space-y-5 p-6 sm:p-8">
              {statusMessage && <div role="alert" className="rounded-2xl border border-[#007D36]/20 bg-[#F3FAF6] px-4 py-3 text-sm font-semibold text-[#075C38]">{statusMessage}</div>}
              <div><label htmlFor="coaching-goal" className="block text-sm font-bold text-[#003D24]">{t("form.goalLabel")}</label><input id="coaching-goal" type="text" required value={goal} onChange={event => setGoal(event.target.value)} placeholder={t("form.goalPlaceholder")} className="mt-2 w-full rounded-2xl border border-[#007D36]/20 bg-[#F8FCF9] px-4 py-3.5 text-sm text-[#17251E] outline-none transition placeholder:text-[#87988C] focus:border-[#007D36] focus:ring-4 focus:ring-[#007D36]/10" /></div>
              <div><label htmlFor="coaching-message" className="block text-sm font-bold text-[#003D24]">{t("form.messageLabel")}</label><textarea id="coaching-message" rows={5} value={message} onChange={event => setMessage(event.target.value)} placeholder={t("form.messagePlaceholder")} className="mt-2 w-full resize-y rounded-2xl border border-[#007D36]/20 bg-[#F8FCF9] px-4 py-3.5 text-sm text-[#17251E] outline-none transition placeholder:text-[#87988C] focus:border-[#007D36] focus:ring-4 focus:ring-[#007D36]/10" /></div>
              <div className="grid grid-cols-2 gap-3 pt-1"><button type="button" onClick={closeRequestForm} disabled={submitting} className="rounded-2xl border border-[#007D36]/20 px-4 py-3.5 text-sm font-bold text-[#075C38] transition hover:bg-[#F3FAF6] disabled:opacity-60">{t("form.cancel")}</button><button type="submit" disabled={submitting} className="rounded-2xl bg-[#FFD21A] px-4 py-3.5 text-sm font-extrabold text-[#003D24] shadow-lg shadow-[#FFD21A]/20 transition hover:bg-[#FFE15C] disabled:cursor-wait disabled:opacity-60">{submitting ? t("form.sending") : t("form.send")}</button></div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
