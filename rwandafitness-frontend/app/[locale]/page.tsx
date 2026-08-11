import {getTranslations} from "next-intl/server";

import FeaturedArticles from "@/components/FeaturedArticles";
import {Link} from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <div className="bg-zinc-50">
      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <section className="rounded-3xl bg-white px-8 py-16 shadow-sm sm:px-12 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
              RwandaFitness
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              {t("hero.title")}
            </h1>

            <p className="mt-6 text-base leading-8 text-zinc-600 sm:text-lg">
              {t("hero.description")}
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/coaches"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                {t("hero.browseCoaches")}
              </Link>

              <Link
                href="/gyms"
                className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
              >
                {t("hero.exploreGyms")}
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />
            <div className="mb-3 text-2xl">💪</div>

            <h2 className="text-lg font-semibold text-zinc-900">
              {t("features.coaches.title")}
            </h2>

            <p className="mt-2 text-sm leading-7 text-zinc-600">
              {t("features.coaches.description")}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />
            <div className="mb-3 text-2xl">🏋️</div>

            <h2 className="text-lg font-semibold text-zinc-900">
              {t("features.gyms.title")}
            </h2>

            <p className="mt-2 text-sm leading-7 text-zinc-600">
              {t("features.gyms.description")}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />
            <div className="mb-3 text-2xl">📩</div>

            <h2 className="text-lg font-semibold text-zinc-900">
              {t("features.requests.title")}
            </h2>

            <p className="mt-2 text-sm leading-7 text-zinc-600">
              {t("features.requests.description")}
            </p>
          </div>
        </section>

        <FeaturedArticles />

        <section className="mt-12 rounded-3xl border border-zinc-200 bg-primary px-8 py-14 text-center text-white shadow-sm">
          <h2 className="text-3xl font-bold tracking-tight">
            {t("cta.title")}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
            {t("cta.description")}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/coaches"
              className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-zinc-100"
            >
              {t("cta.exploreCoaches")}
            </Link>

            <Link
              href="/register"
              className="inline-flex rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {t("cta.createAccount")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}