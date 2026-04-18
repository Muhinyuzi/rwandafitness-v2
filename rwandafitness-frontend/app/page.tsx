import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 bg-zinc-50">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-16 sm:px-10 lg:px-12">
        <section className="flex flex-col items-center justify-center rounded-3xl bg-white px-8 py-20 text-center shadow-sm">
          <span className="mb-4 inline-flex rounded-full bg-zinc-100 px-4 py-1 text-sm font-medium text-zinc-700">
            RwandaFitness
          </span>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Find the right fitness coach for your goals
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
            Connect with coaches in Rwanda, explore profiles, and send coaching
            requests in a simple and modern experience.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/coaches"
              className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Browse Coaches
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
            >
              Create Account
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">💪</div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Experienced Coaches
            </h2>
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              Explore professional coach profiles with specialties, pricing, and
              availability.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">📩</div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Easy Requests
            </h2>
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              Send coaching requests directly from the platform and manage your
              conversations clearly.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 text-2xl">🎯</div>
            <h2 className="text-lg font-semibold text-zinc-900">
              Goal-Oriented Training
            </h2>
            <p className="mt-2 text-sm leading-7 text-zinc-600">
              Whether you want weight loss, muscle gain, or general fitness,
              find coaching that fits your needs.
            </p>
          </div>
        </section>

        <section className="mt-12 rounded-3xl bg-zinc-900 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight">
            Start your fitness journey today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
            Join RwandaFitness and discover a more direct way to connect with
            coaches and build your training plan.
          </p>

          <div className="mt-8">
            <Link
              href="/coaches"
              className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
            >
              Explore Coaches
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}