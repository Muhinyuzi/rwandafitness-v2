import Image from "next/image";
import {getTranslations} from "next-intl/server";

import FeaturedArticles from "@/components/FeaturedArticles";
import {Link} from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <div className="bg-zinc-50">
      <main className="pb-12">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="mx-auto w-full max-w-7xl px-6 pt-8 sm:px-10 lg:px-12">
          <div className="relative min-h-[620px] overflow-hidden rounded-3xl shadow-sm lg:min-h-[700px]">
            <Image
              src="/hero.png"
              alt={t("hero.imageAlt")}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/15" />

            {/* Left-to-right brand gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#031f2b]/95 via-[#043546]/78 to-transparent" />

            {/* Bottom depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

            {/* HERO CONTENT */}
            <div className="relative z-10 flex min-h-[620px] w-full items-center px-6 py-16 sm:px-10 lg:min-h-[700px] lg:px-12">
              <div className="max-w-2xl">
                <div className="flex items-center gap-4">
                  <div className="h-[2px] w-10 rounded-full bg-primary" />

                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary sm:text-sm">
                    {t("hero.eyebrow")}
                  </p>
                </div>

                <h1 className="mt-6 max-w-xl text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
                  {t("hero.title")}
                </h1>

                <p className="mt-7 max-w-xl text-base leading-8 text-white/85 sm:text-lg">
                  {t("hero.description")}
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/coaches"
                    className="inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-primary-dark"
                  >
                    {t("hero.browseCoaches")}
                    <span aria-hidden="true">→</span>
                  </Link>

                  <Link
                    href="/gyms"
                    className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/60 bg-black/10 px-7 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-zinc-900"
                  >
                    {t("hero.exploreGyms")}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                {/* MINI FEATURES */}
                <div className="mt-12 grid max-w-2xl gap-6 border-t border-white/20 pt-7 sm:grid-cols-3">
                  <div>
                    <p className="font-bold text-white">
                      {t("features.coaches.title")}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/65">
                      {t("features.coaches.description")}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      {t("features.gyms.title")}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/65">
                      {t("features.gyms.description")}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      {t("features.videos.title")}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/65">
                      {t("features.videos.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            DISCOVERY CARDS
        ===================================================== */}

        <section className="mx-auto mt-12 w-full max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="mb-7">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              RwandaFitness
            </span>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              {t("discover.title")}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
              {t("discover.description")}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* COACHES */}
            <Link
              href="/coaches"
              className="group relative min-h-[300px] overflow-hidden rounded-3xl bg-zinc-900 shadow-sm"
            >
              <Image
                src="/home-coaches.png"
                alt={t("features.coaches.imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg shadow-sm">
                  💪
                </div>

                <h3 className="mt-4 text-2xl font-bold">
                  {t("features.coaches.title")}
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-white/80">
                  {t("features.coaches.description")}
                </p>

                <span className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary">
                  {t("features.coaches.action")} →
                </span>
              </div>
            </Link>

            {/* GYMS */}
            <Link
              href="/gyms"
              className="group relative min-h-[300px] overflow-hidden rounded-3xl bg-zinc-900 shadow-sm"
            >
              <Image
                src="/home-gyms.png"
                alt={t("features.gyms.imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg shadow-sm">
                  🏋️
                </div>

                <h3 className="mt-4 text-2xl font-bold">
                  {t("features.gyms.title")}
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-white/80">
                  {t("features.gyms.description")}
                </p>

                <span className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary">
                  {t("features.gyms.action")} →
                </span>
              </div>
            </Link>

            {/* VIDEOS */}
            <Link
              href="/videos"
              className="group relative min-h-[300px] overflow-hidden rounded-3xl bg-zinc-900 shadow-sm"
            >
              <Image
                src="/home-videos.png"
                alt={t("features.videos.imageAlt")}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg shadow-sm">
                  ▶
                </div>

                <h3 className="mt-4 text-2xl font-bold">
                  {t("features.videos.title")}
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-white/80">
                  {t("features.videos.description")}
                </p>

                <span className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary">
                  {t("features.videos.action")} →
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* =====================================================
            FEATURED ARTICLES
        ===================================================== */}

        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
          <FeaturedArticles />
        </div>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="mx-auto mt-12 w-full max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="overflow-hidden rounded-3xl bg-primary shadow-sm">
            <div className="grid gap-8 px-8 py-12 text-white lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                  RwandaFitness
                </span>

                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  {t("cta.title")}
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                  {t("cta.description")}
                </p>

                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/90">
                  <span>
                    ✓ {t("cta.points.coaches")}
                  </span>

                  <span>
                    ✓ {t("cta.points.gyms")}
                  </span>

                  <span>
                    ✓ {t("cta.points.content")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  href="/register"
                  className="inline-flex justify-center rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {t("cta.createAccount")}
                </Link>

                <Link
                  href="/coaches"
                  className="inline-flex justify-center rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {t("cta.exploreCoaches")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}