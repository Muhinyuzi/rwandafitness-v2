import Image from "next/image";
import {
  Apple, ArrowRight, CalendarDays, Dumbbell, HeartPulse,
  Medal, PlayCircle, Search, Users,
} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {Link} from "@/i18n/navigation";

const pillarKeys = ["gyms", "coaches", "nutrition", "community", "media"] as const;
const benefitKeys = [
  "discoverGyms", "findCoaches", "readArticles", "joinChallenges",
  "attendEvents", "learnNutrition", "watchMedia", "joinCommunity",
] as const;
const roadmapPhases = ["foundation", "community", "marketplace"] as const;
const impactKeys = ["families", "communities", "youth", "industry"] as const;

const pillarIcons = {
  gyms: Dumbbell,
  coaches: Users,
  nutrition: Apple,
  community: HeartPulse,
  media: PlayCircle,
};
const benefitIcons = {
  discoverGyms: Search,
  findCoaches: Users,
  readArticles: PlayCircle,
  joinChallenges: Medal,
  attendEvents: CalendarDays,
  learnNutrition: Apple,
  watchMedia: PlayCircle,
  joinCommunity: HeartPulse,
};

export default async function AboutPage() {
  const t = await getTranslations("AboutPage");

  return (
    <main className="min-h-screen bg-[#F3FAF6] text-[#17251E]">
      {/* HERO — image originale conservée */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10 lg:pb-20">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_24px_70px_rgba(0,61,36,0.10)] ring-1 ring-[#DCEDE2] lg:rounded-[40px]">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[380px] overflow-hidden bg-[#003D24] sm:min-h-[480px] lg:min-h-[660px]">
              <Image
                src="/about_us.png"
                alt={t("hero.imageAlt")}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#003D24]/75 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-[#003D24]/70 px-4 py-2 text-xs font-bold tracking-wide text-white backdrop-blur-md sm:bottom-8 sm:left-8">
                <span className="h-2 w-2 rounded-full bg-[#00CFFF]" />
                RwandaFitness
              </div>
            </div>
            <div className="relative flex flex-col justify-center overflow-hidden p-7 sm:p-11 lg:p-14 xl:p-16">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#00CFFF]/10 blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F6ED] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#075C38]">
                  <span className="h-2 w-2 rounded-full bg-[#007D36]" />
                  {t("hero.badge")}
                </span>
                <h1 className="mt-6 text-4xl font-black leading-[1.06] tracking-[-0.045em] text-[#003D24] sm:text-5xl xl:text-6xl">
                  {t("hero.title")}
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-[#52675B] sm:text-lg">
                  {t("hero.description")}
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link href="/coaches" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#FFD21A] px-6 py-3 text-sm font-black text-[#003D24] shadow-lg shadow-[#FFD21A]/20 transition hover:-translate-y-0.5 hover:bg-[#FFE15C]">
                    {t("hero.exploreCoaches")}
                    <ArrowRight size={17} aria-hidden="true" className="transition group-hover:translate-x-1" />
                  </Link>
                  <Link href="/gyms" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#C8E1D2] bg-white px-6 py-3 text-sm font-bold text-[#003D24] transition hover:bg-[#EAF6EF]">
                    {t("hero.discoverGyms")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="relative overflow-hidden bg-[#003D24] text-white">
        <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-[#00CFFF]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.22em] text-[#00CFFF]">{t("mission.label")}</span>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl lg:text-5xl">{t("mission.title")}</h2>
            <div className="mt-6 h-1 w-16 rounded-full bg-[#FFD21A]" />
          </div>
          <div className="border-l-2 border-[#00CFFF]/40 pl-6 sm:pl-8">
            <p className="text-base leading-8 text-white/95 sm:text-lg sm:leading-9">{t("mission.description")}</p>
            <p className="mt-5 text-base leading-8 text-white/70">{t("mission.commitment")}</p>
          </div>
        </div>
      </section>

      {/* VISION ET PROMESSE */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[30px] border border-[#DCEDE2] bg-white p-7 shadow-[0_12px_40px_rgba(0,61,36,0.05)] sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F6ED] text-[#007D36]"><HeartPulse size={26} aria-hidden="true" /></div>
            <div className="mt-7 h-1.5 w-14 rounded-full bg-[#007D36]" />
            <h2 className="mt-6 text-2xl font-black tracking-tight text-[#003D24] sm:text-3xl">{t("vision.title")}</h2>
            <p className="mt-5 text-base leading-8 text-[#52675B]">{t("vision.description")}</p>
          </article>
          <article className="rounded-[30px] border border-[#DCEDE2] bg-white p-7 shadow-[0_12px_40px_rgba(0,61,36,0.05)] sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF7CF] text-[#8A6800]"><Medal size={26} aria-hidden="true" /></div>
            <div className="mt-7 h-1.5 w-14 rounded-full bg-[#FFD21A]" />
            <h2 className="mt-6 text-2xl font-black tracking-tight text-[#003D24] sm:text-3xl">{t("promise.title")}</h2>
            <p className="mt-5 text-base leading-8 text-[#52675B]">{t("promise.description")}</p>
          </article>
        </div>
      </section>

      {/* CINQ PILIERS */}
      <section className="border-y border-[#DCEDE2] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-[#007D36]">{t("pillars.label")}</span>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#003D24] sm:text-4xl lg:text-5xl">{t("pillars.title")}</h2>
            <p className="mt-5 text-base leading-8 text-[#52675B]">{t("pillars.description")}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {pillarKeys.map((key, index) => {
              const Icon = pillarIcons[key];
              const featured = index === 0;
              return (
                <article key={key} className={`group rounded-[26px] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg ${featured ? "border-[#003D24] bg-[#003D24] text-white" : "border-[#DCEDE2] bg-[#F3FAF6] text-[#003D24] hover:bg-white"}`}>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${featured ? "bg-white/15 text-[#FFD21A]" : "bg-[#E1F3E9] text-[#007D36]"}`}><Icon size={24} aria-hidden="true" /></div>
                  <h3 className="mt-6 text-lg font-black">{t(`pillars.items.${key}.title`)}</h3>
                  <p className={`mt-3 text-sm leading-7 ${featured ? "text-white/80" : "text-[#52675B]"}`}>{t(`pillars.items.${key}.description`)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* HUIT AVANTAGES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-[#007D36]">{t("benefits.label")}</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#003D24] sm:text-4xl lg:text-5xl">{t("benefits.title")}</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefitKeys.map((key) => {
            const Icon = benefitIcons[key];
            return (
              <div key={key} className="group flex min-h-28 items-center gap-4 rounded-[24px] border border-[#DCEDE2] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E6F6ED] text-[#007D36] transition group-hover:bg-[#007D36] group-hover:text-white"><Icon size={22} aria-hidden="true" /></div>
                <p className="text-sm font-bold leading-6 text-[#304A3B]">{t(`benefits.items.${key}`)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* IMPACT */}
      <section className="relative overflow-hidden bg-[#062B20] text-white">
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#00CFFF]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.22em] text-[#FFD21A]">{t("impact.label")}</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{t("impact.title")}</h2>
            <p className="mt-6 text-base leading-8 text-white/70">{t("impact.description")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {impactKeys.map((key, index) => (
              <div key={key} className="rounded-[24px] border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm">
                <span className="text-xs font-black text-[#00CFFF]">0{index + 1}</span>
                <p className="mt-4 text-sm font-semibold leading-7 text-white/90">{t(`impact.items.${key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEUILLE DE ROUTE */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-3xl">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-[#007D36]">{t("roadmap.label")}</span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#003D24] sm:text-4xl lg:text-5xl">{t("roadmap.title")}</h2>
          <p className="mt-5 text-base leading-8 text-[#52675B]">{t("roadmap.description")}</p>
        </div>
        <div className="relative mt-12 grid gap-6 lg:grid-cols-3">
          <div className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-[#B7DCC6] lg:block" />
          {roadmapPhases.map((phase, index) => (
            <article key={phase} className="relative rounded-[28px] border border-[#DCEDE2] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8">
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#007D36] text-sm font-black text-white shadow-lg shadow-[#007D36]/20">{index + 1}</div>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#007D36]">{t(`roadmap.phases.${phase}.period`)}</p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-[#003D24]">{t(`roadmap.phases.${phase}.title`)}</h3>
              <p className="mt-4 text-sm leading-7 text-[#52675B]">{t(`roadmap.phases.${phase}.description`)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* APPEL À L'ACTION */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="relative overflow-hidden rounded-[32px] bg-[#003D24] px-6 py-12 text-center text-white shadow-xl sm:px-10 sm:py-16 lg:px-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#00CFFF]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#FFD21A]/10 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00CFFF]">RwandaFitness</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{t("cta.title")}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/80">{t("cta.description")}</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/coaches" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#FFD21A] px-6 py-3 text-sm font-black text-[#003D24] transition hover:bg-[#FFE15C]">
                {t("cta.findCoach")}
                <ArrowRight size={17} aria-hidden="true" className="transition group-hover:translate-x-1" />
              </Link>
              <Link href="/gyms" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/20">
                {t("cta.exploreGyms")}
              </Link>
            </div>
            <div className="mx-auto mt-9 h-px max-w-xs bg-white/20" />
            <p className="mt-6 text-sm font-semibold text-white/65">{t("cta.founder")}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
