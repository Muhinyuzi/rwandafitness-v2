import Image from "next/image";
import {
  Apple,
  ArrowRight,
  CalendarDays,
  Dumbbell,
  HeartPulse,
  Medal,
  PlayCircle,
  Search,
  Users,
} from "lucide-react";
import {getTranslations} from "next-intl/server";

import {Link} from "@/i18n/navigation";

const pillarKeys = [
  "gyms",
  "coaches",
  "nutrition",
  "community",
  "media",
] as const;

const benefitKeys = [
  "discoverGyms",
  "findCoaches",
  "readArticles",
  "joinChallenges",
  "attendEvents",
  "learnNutrition",
  "watchMedia",
  "joinCommunity",
] as const;

const roadmapPhases = [
  "foundation",
  "community",
  "marketplace",
] as const;

const impactKeys = [
  "families",
  "communities",
  "youth",
  "industry",
] as const;

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
  const t = await getTranslations(
    "AboutPage",
  );

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 sm:pb-14 sm:pt-8 lg:pb-16">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-xl ring-1 ring-zinc-200 sm:rounded-[40px]">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
            {/* IMAGE */}

            <div className="relative min-h-[430px] overflow-hidden bg-zinc-900 sm:min-h-[520px] lg:min-h-[680px]">
              <Image
                src="/about_us.png"
                alt={t("hero.imageAlt")}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/5 lg:bg-gradient-to-r lg:from-black/10 lg:via-transparent lg:to-black/5" />

              {/* Mobile image caption / branding */}

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:hidden">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/35 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-accent" />

                  RwandaFitness
                </div>
              </div>
            </div>

            {/* CONTENT */}

            <div className="relative flex flex-col justify-center overflow-hidden p-6 sm:p-10 lg:p-14 xl:p-16">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-accent/5 blur-3xl" />

              <div className="relative">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-primary">
                  <span className="h-2 w-2 rounded-full bg-primary" />

                  {t("hero.badge")}
                </span>

                <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.045em] text-zinc-950 sm:text-5xl lg:text-6xl xl:text-7xl">
                  {t("hero.title")}
                </h1>

                <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600 sm:text-lg">
                  {t(
                    "hero.description",
                  )}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/coaches"
                    className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary-dark"
                  >
                    <span>
                      {t(
                        "hero.exploreCoaches",
                      )}
                    </span>

                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                      className="transition group-hover:translate-x-0.5"
                    />
                  </Link>

                  <Link
                    href="/gyms"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-zinc-300 bg-white px-6 py-3 text-sm font-bold text-zinc-900 transition hover:-translate-y-0.5 hover:bg-zinc-50"
                  >
                    {t(
                      "hero.discoverGyms",
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION
      ====================================================== */}

      <section className="relative overflow-hidden bg-primary text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-black/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.22em] text-white/65 sm:text-sm">
              {t("mission.label")}
            </span>

            <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              {t("mission.title")}
            </h2>
          </div>

          <div className="border-l border-white/20 pl-6 sm:pl-8">
            <p className="text-base leading-8 text-white/95 sm:text-lg sm:leading-9">
              {t(
                "mission.description",
              )}
            </p>

            <p className="mt-5 text-base leading-8 text-white/75">
              {t(
                "mission.commitment",
              )}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          VISION / PROMISE
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* VISION */}

          <article className="relative overflow-hidden rounded-[30px] border border-zinc-200 bg-white p-7 shadow-sm sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <HeartPulse
                  size={24}
                  aria-hidden="true"
                />
              </div>

              <div className="mt-7 h-1.5 w-14 rounded-full bg-primary" />

              <h2 className="mt-6 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                {t("vision.title")}
              </h2>

              <p className="mt-5 text-base leading-8 text-zinc-600">
                {t(
                  "vision.description",
                )}
              </p>
            </div>
          </article>

          {/* PROMISE */}

          <article className="relative overflow-hidden rounded-[30px] border border-zinc-200 bg-white p-7 shadow-sm sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <Medal
                  size={24}
                  aria-hidden="true"
                />
              </div>

              <div className="mt-7 h-1.5 w-14 rounded-full bg-accent" />

              <h2 className="mt-6 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
                {t(
                  "promise.title",
                )}
              </h2>

              <p className="mt-5 text-base leading-8 text-zinc-600">
                {t(
                  "promise.description",
                )}
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* =====================================================
          PILLARS
      ====================================================== */}

      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-primary sm:text-sm">
              {t("pillars.label")}
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-zinc-950 sm:text-4xl lg:text-5xl">
              {t("pillars.title")}
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600">
              {t(
                "pillars.description",
              )}
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {pillarKeys.map(
              (key, index) => {
                const Icon =
                  pillarIcons[key];

                return (
                  <article
                    key={key}
                    className={`group relative overflow-hidden rounded-[26px] border border-zinc-200 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      index === 0
                        ? "bg-primary text-white"
                        : "bg-zinc-50 text-zinc-950 hover:bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        index === 0
                          ? "bg-white/15 text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon
                        size={24}
                        aria-hidden="true"
                      />
                    </div>

                    <h3
                      className={`mt-6 text-lg font-black ${
                        index === 0
                          ? "text-white"
                          : "text-zinc-950"
                      }`}
                    >
                      {t(
                        `pillars.items.${key}.title`,
                      )}
                    </h3>

                    <p
                      className={`mt-3 text-sm leading-7 ${
                        index === 0
                          ? "text-white/80"
                          : "text-zinc-600"
                      }`}
                    >
                      {t(
                        `pillars.items.${key}.description`,
                      )}
                    </p>
                  </article>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          BENEFITS
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-primary sm:text-sm">
            {t("benefits.label")}
          </span>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-zinc-950 sm:text-4xl lg:text-5xl">
            {t("benefits.title")}
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefitKeys.map(
            (key) => {
              const Icon =
                benefitIcons[key];

              return (
                <div
                  key={key}
                  className="group flex min-h-28 items-center gap-4 rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon
                      size={22}
                      aria-hidden="true"
                    />
                  </div>

                  <p className="text-sm font-bold leading-6 text-zinc-800">
                    {t(
                      `benefits.items.${key}`,
                    )}
                  </p>
                </div>
              );
            },
          )}
        </div>
      </section>

      {/* =====================================================
          IMPACT
      ====================================================== */}

      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div className="pointer-events-none absolute -left-36 top-10 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-accent sm:text-sm">
                {t("impact.label")}
              </span>

              <h2 className="mt-4 max-w-xl text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                {t("impact.title")}
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/70">
                {t(
                  "impact.description",
                )}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {impactKeys.map(
                (key, index) => (
                  <div
                    key={key}
                    className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm"
                  >
                    <span className="text-xs font-black text-white/30">
                      0{index + 1}
                    </span>

                    <p className="mt-4 text-sm font-semibold leading-7 text-white/90">
                      {t(
                        `impact.items.${key}`,
                      )}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ROADMAP
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-3xl">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-primary sm:text-sm">
            {t("roadmap.label")}
          </span>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-zinc-950 sm:text-4xl lg:text-5xl">
            {t("roadmap.title")}
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600">
            {t(
              "roadmap.description",
            )}
          </p>
        </div>

        <div className="relative mt-12 grid gap-6 lg:grid-cols-3">
          {/* Desktop timeline line */}

          <div className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-6 hidden h-px bg-zinc-200 lg:block" />

          {roadmapPhases.map(
            (
              phase,
              index,
            ) => (
              <article
                key={phase}
                className="relative rounded-[28px] border border-zinc-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
              >
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-black text-white shadow-lg shadow-primary/20">
                  {index + 1}
                </div>

                <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-primary">
                  {t(
                    `roadmap.phases.${phase}.period`,
                  )}
                </p>

                <h3 className="mt-2 text-xl font-black tracking-tight text-zinc-950">
                  {t(
                    `roadmap.phases.${phase}.title`,
                  )}
                </h3>

                <p className="mt-4 text-sm leading-7 text-zinc-600">
                  {t(
                    `roadmap.phases.${phase}.description`,
                  )}
                </p>
              </article>
            ),
          )}
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="relative overflow-hidden rounded-[32px] bg-primary px-6 py-12 text-center text-white shadow-xl sm:px-10 sm:py-16 lg:px-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/65">
              RwandaFitness
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              {t("cta.title")}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/85">
              {t(
                "cta.description",
              )}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/coaches"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-primary shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-50"
              >
                {t(
                  "cta.findCoach",
                )}

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                  className="transition group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/gyms"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                {t(
                  "cta.exploreGyms",
                )}
              </Link>
            </div>

            <div className="mx-auto mt-9 h-px max-w-xs bg-white/20" />

            <p className="mt-6 text-sm font-semibold text-white/65">
              {t("cta.founder")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}