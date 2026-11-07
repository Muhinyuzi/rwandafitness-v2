"use client";

import {useEffect, useMemo, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string | null;
  category: string;
  published_at: string | null;
};

type ArticlesResponse = Article[] | {results?: Article[]};

export default function ArticlesPage() {
  const t = useTranslations("ArticlesPage");
  const locale = useLocale();
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const labels = locale === "rw"
    ? {search: "Shakisha inkuru...", all: "Byose", results: "Inkuru zabonetse", noResults: "Nta nkuru zihuye n'ibyo ushaka.", clear: "Kuraho ibyo washakishije", latest: "Inkuru nshya", explore: "Soma inkuru", featured: "Inkuru yihariye"}
    : {search: "Search articles...", all: "All topics", results: "Articles found", noResults: "No articles match your search.", clear: "Clear filters", latest: "Latest stories", explore: "Explore article", featured: "Featured story"};

  useEffect(() => {
    const controller = new AbortController();
    async function loadArticles() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_URL}/api/articles/?lang=${locale}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to load articles");
        const data: ArticlesResponse = await response.json();
        if (!controller.signal.aborted) {
          setArticles(Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : []);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (!controller.signal.aborted) {
          setArticles([]);
          setError(t("states.error"));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadArticles();
    return () => controller.abort();
  }, [locale, t]);

  const categories = useMemo(() =>
    [...new Set(articles.map((article) => article.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  [articles]);

  const filteredArticles = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return articles.filter((article) => {
      const matchesCategory = !category || article.category === category;
      const matchesSearch = !term || [article.title, article.excerpt, article.category]
        .some((value) => (value || "").toLocaleLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [articles, category, search]);

  function formatPublishedDate(value: string | null) {
    if (!value) return t("article.unknownDate");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("article.unknownDate");
    return new Intl.DateTimeFormat(locale, {year: "numeric", month: "long", day: "numeric"}).format(date);
  }

  const hasFilters = Boolean(search.trim() || category);
  const featured = !hasFilters && filteredArticles.length > 2 ? filteredArticles[0] : null;
  const regularArticles = featured ? filteredArticles.slice(1) : filteredArticles;

  const ArticleCard = ({article}: {article: Article}) => (
    <Link href={`/articles/${article.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#075C38]/10 bg-white shadow-[0_12px_40px_rgba(0,61,36,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#00CFFF]/60 hover:shadow-[0_24px_55px_rgba(0,61,36,0.13)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#007D36]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#E8F3EC]">
        {article.cover_image_url ? (
          <img src={article.cover_image_url} alt={article.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#075C38] via-[#007D36] to-[#00CFFF] text-white">
            <span className="text-6xl font-black tracking-tighter opacity-90">RF.</span>
            <span className="mt-2 text-xs font-medium text-white/80">{t("article.noImage")}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#003D24]/35 via-transparent to-transparent" />
        {article.category && <span className="absolute left-4 top-4 max-w-[85%] truncate rounded-full border border-white/50 bg-white/95 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#075C38] shadow-sm backdrop-blur">{article.category}</span>}
        <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD21A] text-xl font-bold text-[#003D24] shadow-lg transition-transform group-hover:rotate-[-35deg]">↗</span>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <time dateTime={article.published_at ?? undefined} className="text-xs font-semibold uppercase tracking-widest text-[#007D36]">{formatPublishedDate(article.published_at)}</time>
        <h3 className="mt-3 font-serif text-[23px] font-bold leading-snug tracking-tight text-[#17251E] transition-colors group-hover:text-[#007D36]">{article.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#526459]">{article.excerpt}</p>
        <div className="mt-auto flex items-center justify-between border-t border-[#075C38]/10 pt-5 text-sm font-extrabold text-[#075C38]" style={{marginTop: "auto", paddingTop: "1.25rem"}}>
          <span>{t("article.readMore")}</span><span className="text-lg transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );

  return (
    <main className="min-h-screen bg-[#F3FAF6] pb-20">
      <section className="relative isolate overflow-hidden bg-[#003D24] text-white">
        <div className="pointer-events-none absolute -right-24 -top-44 h-[480px] w-[480px] rounded-full border-[75px] border-[#00CFFF]/10" />
        <div className="pointer-events-none absolute -bottom-64 left-1/4 h-[450px] w-[450px] rounded-full bg-[#00CFFF]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[12%] top-[20%] hidden font-serif text-[240px] font-black leading-none text-white/[0.035] lg:block">RF</div>
        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-8 sm:pb-28 sm:pt-20 lg:pt-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00CFFF]/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#9CEFFF] backdrop-blur"><span className="h-2 w-2 rounded-full bg-[#FFD21A]" />{t("header.badge")}</span>
            <h1 className="mt-7 font-serif text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">{t("header.title")}</h1>
            <div className="mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#FFD21A] to-[#00CFFF]" />
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">{t("header.description")}</p>
            {!loading && articles.length > 0 && <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold"><span className="text-[#FFD21A]">✦</span>{articles.length} {labels.results.toLowerCase()}</div>}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#FFD21A] via-[#00CFFF] to-[#007D36]" />
      </section>

      <div className="relative z-10 mx-auto -mt-10 max-w-7xl px-5 sm:px-8">
        <div className="rounded-[26px] border border-[#075C38]/10 bg-white p-4 shadow-[0_18px_60px_rgba(0,61,36,0.12)] sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <span className="sr-only">{labels.search}</span>
              <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#007D36]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={labels.search} className="w-full rounded-2xl border border-[#075C38]/15 bg-[#F3FAF6] py-3.5 pl-12 pr-4 text-sm text-[#17251E] outline-none transition focus:border-[#007D36] focus:ring-4 focus:ring-[#00CFFF]/15" />
            </label>
            <label className="md:w-60">
              <span className="sr-only">{labels.all}</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-2xl border border-[#075C38]/15 bg-[#F3FAF6] px-4 py-3.5 text-sm font-semibold text-[#075C38] outline-none focus:border-[#007D36] focus:ring-4 focus:ring-[#00CFFF]/15">
                <option value="">{labels.all}</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            {hasFilters && <button type="button" onClick={() => {setSearch(""); setCategory("");}} className="rounded-2xl border border-[#075C38]/15 px-5 py-3.5 text-sm font-semibold text-[#075C38] transition hover:bg-[#F3FAF6]">{labels.clear}</button>}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({length: 6}, (_, index) => <div key={index} className="overflow-hidden rounded-[28px] border border-[#075C38]/10 bg-white"><div className="aspect-[16/10] animate-pulse bg-[#DDECE2]"/><div className="space-y-4 p-6"><div className="h-3 w-28 animate-pulse rounded bg-[#DDECE2]"/><div className="h-7 w-4/5 animate-pulse rounded bg-[#DDECE2]"/><div className="h-4 w-full animate-pulse rounded bg-[#EAF3ED]"/><div className="h-4 w-3/4 animate-pulse rounded bg-[#EAF3ED]"/></div></div>)}
          </div>
        ) : error ? (
          <div role="alert" className="rounded-3xl border border-red-200 bg-white px-8 py-10 text-center text-red-700 shadow-sm">{error}</div>
        ) : articles.length === 0 ? (
          <div className="rounded-3xl border border-[#075C38]/10 bg-white px-8 py-16 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3FAF6] text-3xl text-[#007D36]">✦</div><p className="mt-5 text-[#526459]">{t("states.empty")}</p></div>
        ) : filteredArticles.length === 0 ? (
          <div className="rounded-3xl border border-[#075C38]/10 bg-white px-8 py-16 text-center shadow-sm"><p className="text-[#526459]">{labels.noResults}</p><button type="button" onClick={() => {setSearch(""); setCategory("");}} className="mt-5 rounded-full bg-[#075C38] px-6 py-3 text-sm font-bold text-white hover:bg-[#007D36]">{labels.clear}</button></div>
        ) : (
          <>
            {featured && (
              <div className="mb-14">
                <div className="mb-6 flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-[#FFD21A] ring-4 ring-[#FFD21A]/20"/><span className="text-xs font-black uppercase tracking-[0.2em] text-[#075C38]">{labels.featured}</span></div>
                <Link href={`/articles/${featured.slug}`} className="group grid overflow-hidden rounded-[32px] border border-[#075C38]/10 bg-white shadow-[0_20px_60px_rgba(0,61,36,0.09)] transition-all hover:shadow-[0_28px_70px_rgba(0,61,36,0.16)] lg:grid-cols-[1.12fr_0.88fr]">
                  <div className="relative min-h-[300px] overflow-hidden bg-[#075C38] sm:min-h-[390px]">
                    {featured.cover_image_url ? <img src={featured.cover_image_url} alt={featured.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"/> : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#075C38] to-[#00CFFF] font-serif text-8xl font-black text-white/80">RF.</div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#003D24]/30 to-transparent"/>
                    {featured.category && <span className="absolute left-6 top-6 rounded-full bg-[#FFD21A] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-[#003D24]">{featured.category}</span>}
                  </div>
                  <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                    <time dateTime={featured.published_at ?? undefined} className="text-xs font-bold uppercase tracking-[0.16em] text-[#007D36]">{formatPublishedDate(featured.published_at)}</time>
                    <h2 className="mt-5 font-serif text-3xl font-bold leading-tight tracking-tight text-[#17251E] transition group-hover:text-[#007D36] sm:text-4xl">{featured.title}</h2>
                    <p className="mt-5 line-clamp-4 text-sm leading-8 text-[#526459] sm:text-base">{featured.excerpt}</p>
                    <span className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-[#075C38] px-6 py-3.5 text-sm font-extrabold text-white transition group-hover:bg-[#007D36]">{t("article.readMore")} <span className="text-[#FFD21A]">↗</span></span>
                  </div>
                </Link>
              </div>
            )}
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><span className="text-xs font-bold uppercase tracking-[0.2em] text-[#007D36]">RwandaFitness</span><h2 className="mt-2 font-serif text-3xl font-bold text-[#17251E] sm:text-4xl">{labels.latest}</h2></div><span className="rounded-full border border-[#075C38]/15 bg-white px-4 py-2 text-xs font-bold text-[#075C38]">{filteredArticles.length} {labels.results.toLowerCase()}</span></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{regularArticles.map((article) => <ArticleCard key={article.id} article={article}/>)}</div>
          </>
        )}
      </section>
    </main>
  );
}
