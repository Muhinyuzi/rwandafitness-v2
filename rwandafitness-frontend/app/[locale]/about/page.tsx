import Image from "next/image";
import {
  Apple,
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
    <div className="bg-zinc-50">
      <main>
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-[420px] bg-zinc-100 lg:min-h-[620px]">
                <Image
                  src="/about_us.JPG"
                  alt={t("hero.imageAlt")}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              </div>

              <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
                <span className="inline-flex w-fit rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {t("hero.badge")}
                </span>

                <h1 className="mt-6 text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
                  {t("hero.title")}
                </h1>

                <p className="mt-6 text-base leading-8 text-zinc-600 sm:text-lg">
                  {t("hero.description")}
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/coaches"
                    className="rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-dark"
                  >
                    {t("hero.exploreCoaches")}
                  </Link>

                  <Link
                    href="/gyms"
                    className="rounded-xl border border-zinc-300 px-6 py-3 text-center text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
                  >
                    {t("hero.discoverGyms")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">
                {t("mission.label")}
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                {t("mission.title")}
              </h2>
            </div>

            <div>
              <p className="text-base leading-8 text-white/90 sm:text-lg">
                {t("mission.description")}
              </p>

              <p className="mt-5 text-base leading-8 text-white/80">
                {t("mission.commitment")}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <article className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="h-1.5 w-16 rounded-full bg-primary" />

              <h2 className="mt-6 text-2xl font-bold text-zinc-900">
                {t("vision.title")}
              </h2>

              <p className="mt-5 text-base leading-8 text-zinc-600">
                {t("vision.description")}
              </p>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="h-1.5 w-16 rounded-full bg-accent" />

              <h2 className="mt-6 text-2xl font-bold text-zinc-900">
                {t("promise.title")}
              </h2>

              <p className="mt-5 text-base leading-8 text-zinc-600">
                {t("promise.description")}
              </p>
            </article>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-3xl">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
                {t("pillars.label")}
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                {t("pillars.title")}
              </h2>

              <p className="mt-4 text-base leading-8 text-zinc-600">
                {t("pillars.description")}
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {pillarKeys.map((key) => {
                const Icon = pillarIcons[key];

                return (
                  <article
                    key={key}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon size={24} aria-hidden="true" />
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-zinc-900">
                      {t(`pillars.items.${key}.title`)}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-zinc-600">
                      {t(`pillars.items.${key}.description`)}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              {t("benefits.label")}
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
              {t("benefits.title")}
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefitKeys.map((key) => {
              const Icon = benefitIcons[key];

              return (
                <div
                  key={key}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon size={22} aria-hidden="true" />
                  </div>

                  <p className="text-sm font-semibold text-zinc-800">
                    {t(`benefits.items.${key}`)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-zinc-900 text-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
                  {t("impact.label")}
                </span>

                <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                  {t("impact.title")}
                </h2>

                <p className="mt-6 text-base leading-8 text-white/75">
                  {t("impact.description")}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {(["families", "communities", "youth", "industry"] as const).map(
                  (key) => (
                    <div
                      key={key}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6"
                    >
                      <p className="text-sm font-semibold leading-7 text-white/90">
                        {t(`impact.items.${key}`)}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="max-w-3xl">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              {t("roadmap.label")}
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
              {t("roadmap.title")}
            </h2>

            <p className="mt-4 text-base leading-8 text-zinc-600">
              {t("roadmap.description")}
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {roadmapPhases.map((phase, index) => (
              <article
                key={phase}
                className="relative rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
                  {index + 1}
                </span>

                <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  {t(`roadmap.phases.${phase}.period`)}
                </p>

                <h3 className="mt-2 text-xl font-bold text-zinc-900">
                  {t(`roadmap.phases.${phase}.title`)}
                </h3>

                <p className="mt-4 text-sm leading-7 text-zinc-600">
                  {t(`roadmap.phases.${phase}.description`)}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="rounded-3xl bg-primary px-8 py-14 text-center text-white shadow-sm sm:px-12">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              {t("cta.title")}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/85">
              {t("cta.description")}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/coaches"
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-zinc-100"
              >
                {t("cta.findCoach")}
              </Link>

              <Link
                href="/gyms"
                className="rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t("cta.exploreGyms")}
              </Link>
            </div>

            <p className="mt-8 text-sm font-semibold text-white/75">
              {t("cta.founder")}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}