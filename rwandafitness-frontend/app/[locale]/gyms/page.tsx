"use client";

import {useEffect, useMemo, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Gym = {
  id: number;
  name: string;
  description: string;
  city: string;
  cover_image_url: string | null;
  is_verified: boolean;
  slug: string | null;
};
type GymsApiResponse = Gym[] | {results?: Gym[]};

export default function GymsPage() {
  const locale = useLocale();
  const t = useTranslations("Gyms");
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const labels = locale === "rw"
    ? {eyebrow: "AHO WAKORERA IMYITOZO", search: "Shakisha izina cyangwa umujyi", allCities: "Imijyi yose", verifiedOnly: "Ahantu hagenzuwe gusa", results: "Ahantu habonetse", reset: "Kuraho amahitamo", explore: "Menya aho wakorera imyitozo", featured: "Ahantu hagenzuwe"}
    : {eyebrow: "TRAINING DESTINATIONS", search: "Search gyms or cities", allCities: "All cities", verifiedOnly: "Verified gyms only", results: "Gyms found", reset: "Clear filters", explore: "Find your place to train", featured: "Verified location"};

  useEffect(() => {
    const controller = new AbortController();
    async function loadGyms() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_URL}/api/gyms/?lang=${locale}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to load gyms");
        const data: GymsApiResponse = await response.json();
        if (!controller.signal.aborted) {
          setGyms(Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : []);
        }
      } catch (caughtError) {
        if (caughtError instanceof Error && caughtError.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setGyms([]);
          setError(t("messages.loadFailed"));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadGyms();
    return () => controller.abort();
  }, [locale, t]);

  const cities = useMemo(() => [...new Set(gyms.map(gym => gym.city.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [gyms]);
  const filtered = useMemo(() => gyms.filter(gym => {
    const term = search.trim().toLocaleLowerCase();
    return (!term || `${gym.name} ${gym.city} ${gym.description || ""}`.toLocaleLowerCase().includes(term))
      && (!city || gym.city === city)
      && (!verifiedOnly || gym.is_verified);
  }), [gyms, search, city, verifiedOnly]);

  const resetFilters = () => {setSearch(""); setCity(""); setVerifiedOnly(false);};

  const renderGym = (gym: Gym) => {
    const content = (
      <>
        <div className="relative aspect-[5/4] overflow-hidden bg-[#E6F2EB] sm:aspect-[4/3]">
          {gym.cover_image_url ? (
            <img src={gym.cover_image_url} alt={gym.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#E4F3E8] via-[#D5EBDD] to-[#BBD8C6] text-[#075C38]">
              <svg viewBox="0 0 64 64" fill="none" className="h-16 w-16" aria-hidden="true"><path d="M8 25v14m7-20v26m34-26v26m7-20v14M15 32h34" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></svg>
              <span className="mt-3 text-sm font-semibold">{t("noImage")}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#002A1A]/75 via-transparent to-transparent" />
          {gym.is_verified && <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#FFD21A] px-3 py-1.5 text-xs font-extrabold text-[#003D24] shadow-md"><span aria-hidden="true">✓</span>{t("verified")}</span>}
          {gym.city && <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#003D24]/65 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"><span aria-hidden="true">⌖</span>{gym.city}</span>}
          {gym.slug && <span aria-hidden="true" className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD21A] text-lg font-bold text-[#003D24] transition group-hover:translate-x-1">↗</span>}
        </div>
        <div className="flex flex-1 flex-col px-5 pb-6 pt-5 sm:px-6">
          <h2 className="text-xl font-black tracking-tight text-[#003D24] transition group-hover:text-[#007D36] sm:text-2xl">{gym.name}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#52645A]">{gym.description || t("noDescription")}</p>
          {gym.slug && <div className="mt-auto flex items-center justify-between border-t border-[#E4EEE7] pt-4 text-sm font-bold text-[#075C38]" style={{marginTop: "1.5rem"}}><span>{t("viewGym")}</span><span aria-hidden="true">→</span></div>}
        </div>
      </>
    );
    const classes = "group flex h-full flex-col overflow-hidden rounded-[26px] border border-[#DCE9E0] bg-white shadow-[0_12px_38px_rgba(0,61,36,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,61,36,0.13)]";
    return gym.slug ? <Link key={gym.id} href={`/gyms/${gym.slug}`} className={classes}>{content}</Link> : <article key={gym.id} className={classes}>{content}</article>;
  };

  return (
    <main className="min-h-screen bg-[#F3FAF6] pb-20">
      <section className="relative overflow-hidden bg-[#003D24] text-white">
        <div className="pointer-events-none absolute -right-24 -top-40 h-96 w-96 rounded-full bg-[#00CFFF]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-80 rounded-full bg-[#007D36]/45 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-14 sm:px-8 sm:pb-28 sm:pt-20">
          <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[#FFD21A]"><span className="h-2 w-2 rounded-full bg-[#00CFFF]" />{labels.eyebrow}</span>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{t("title")}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">{t("description")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold">{loading ? "…" : gyms.length} {labels.results}</span><span className="text-sm text-[#B5D9C4]">{labels.explore}</span></div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-7xl px-5 sm:px-8" aria-label={labels.explore}>
        <div className="grid gap-4 rounded-[26px] border border-[#DDECE2] bg-white p-4 shadow-[0_18px_60px_rgba(0,61,36,0.12)] sm:p-6 lg:grid-cols-[1fr_240px_auto] lg:items-center">
          <label className="relative block"><span className="sr-only">{labels.search}</span><span aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#075C38]">⌕</span><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder={labels.search} className="h-12 w-full rounded-xl border border-[#DCE9E0] bg-[#F8FCF9] pl-11 pr-4 text-sm text-[#17251E] outline-none transition focus:border-[#007D36] focus:ring-2 focus:ring-[#007D36]/15" /></label>
          <label className="block"><span className="sr-only">{labels.allCities}</span><select value={city} onChange={event => setCity(event.target.value)} className="h-12 w-full rounded-xl border border-[#DCE9E0] bg-[#F8FCF9] px-4 text-sm text-[#17251E] outline-none focus:border-[#007D36] focus:ring-2 focus:ring-[#007D36]/15"><option value="">{labels.allCities}</option>{cities.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#F3FAF6] px-4 py-3 text-sm font-semibold text-[#075C38]"><input type="checkbox" checked={verifiedOnly} onChange={event => setVerifiedOnly(event.target.checked)} className="h-4 w-4 accent-[#007D36]" />{labels.verifiedOnly}</label>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#007D36]">RwandaFitness</span><h2 className="mt-2 text-2xl font-black tracking-tight text-[#003D24] sm:text-3xl">{labels.explore}</h2></div><div className="flex items-center gap-4"><span className="text-sm font-semibold text-[#52645A]">{loading ? "…" : filtered.length} {labels.results}</span>{(search || city || verifiedOnly) && <button type="button" onClick={resetFilters} className="text-sm font-bold text-[#007D36] underline underline-offset-4">{labels.reset}</button>}</div></div>
        {error && <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>}
        {loading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading gyms">{Array.from({length: 6}, (_, index) => <div key={index} className="overflow-hidden rounded-[26px] border border-[#DCE9E0] bg-white"><div className="aspect-[4/3] animate-pulse bg-[#DDEBE2]" /><div className="space-y-4 p-6"><div className="h-7 w-2/3 animate-pulse rounded bg-[#DDEBE2]" /><div className="h-4 w-full animate-pulse rounded bg-[#EDF5EF]" /><div className="h-4 w-3/4 animate-pulse rounded bg-[#EDF5EF]" /></div></div>)}</div> : !error && filtered.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(renderGym)}</div> : !error && <div className="rounded-[26px] border border-[#DCE9E0] bg-white px-6 py-16 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E9F5EC] text-3xl" aria-hidden="true">⌕</div><p className="mt-5 text-base font-semibold text-[#52645A]">{gyms.length === 0 ? t("empty") : labels.results + ": 0"}</p>{gyms.length > 0 && <button type="button" onClick={resetFilters} className="mt-5 rounded-xl bg-[#003D24] px-5 py-3 text-sm font-bold text-white hover:bg-[#075C38]">{labels.reset}</button>}</div>}
      </section>
    </main>
  );
}
