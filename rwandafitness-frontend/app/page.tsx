import Link from "next/link";
import FeaturedArticles from "@/components/FeaturedArticles";

export default function HomePage() {
  return (
    <div className="bg-zinc-50">
      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 lg:px-12">
        <section className="rounded-3xl bg-white px-8 py-16 shadow-sm sm:px-12 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
              RwandaFitness
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Discover coaches and gyms across Rwanda
            </h1>

            <p className="mt-6 text-base leading-8 text-zinc-600 sm:text-lg">
              Explore fitness coaches, discover gyms, and send coaching requests
              through a simple, local, and modern platform built for Rwanda.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/coaches"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Browse Coaches
              </Link>

              <Link
                href="/gyms"
                className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
              >
                Explore Gyms
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />
            <div className="mb-3 text-2xl">💪</div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Experienced Coaches
            </h2>
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              Explore coach profiles with specialties, pricing, experience, and
              availability.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />
            <div className="mb-3 text-2xl">🏋️</div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Discover Gyms
            </h2>
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              Find gyms across Rwanda, explore their spaces, and discover the
              coaches connected to them.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />
            <div className="mb-3 text-2xl">📩</div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Easy Requests
            </h2>
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              Send coaching requests directly from the platform and manage your
              interactions clearly.
            </p>
          </div>
        </section>

        <FeaturedArticles />

        <section className="mt-12 rounded-3xl border border-zinc-200 bg-primary px-8 py-14 text-center text-white shadow-sm">
          <h2 className="text-3xl font-bold tracking-tight">
            Start your fitness journey today
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
            Join RwandaFitness and connect with coaches and gyms in a more
            direct, local, and modern way.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/coaches"
              className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-zinc-100"
            >
              Explore Coaches
            </Link>

            <Link
              href="/register"
              className="inline-flex rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Create Account
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}