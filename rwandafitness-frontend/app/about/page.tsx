import Image from "next/image";
import Link from "next/link";

const features = [
  "Discover gyms",
  "Find fitness coaches",
  "Read fitness articles",
  "Request coaching",
  "Follow fitness tips",
  "Build healthy habits",
];

export default function AboutPage() {
  return (
    <div className="bg-zinc-50">
      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="rounded-3xl bg-white p-8 shadow-sm sm:p-12">
          <div className="mb-8 h-1.5 w-16 rounded-full bg-primary" />

          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative min-h-[420px] overflow-hidden rounded-3xl bg-zinc-100">
              <Image
                src="/about_us.JPG"
                alt="RwandaFitness community and healthy lifestyle"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>

            <div>
              <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                About RwandaFitness
              </span>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
                Building a healthier Rwanda through fitness.
              </h1>

              <p className="mt-6 text-base leading-8 text-zinc-600 sm:text-lg">
                RwandaFitness is a platform dedicated to promoting fitness,
                healthy living, coaching, and gym culture across Rwanda.
              </p>

              <p className="mt-4 text-base leading-8 text-zinc-600 sm:text-lg">
                Our goal is to help people discover trusted coaches, find gyms,
                read useful fitness articles, and start their fitness journey
                with confidence.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/coaches"
                  className="rounded-xl bg-primary px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  Explore Coaches
                </Link>

                <Link
                  href="/gyms"
                  className="rounded-xl border border-zinc-300 px-6 py-3 text-center text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
                >
                  Discover Gyms
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />

            <h2 className="text-lg font-semibold text-zinc-900">
              Our Mission
            </h2>

            <p className="mt-3 text-sm leading-7 text-zinc-600">
              To make fitness information, coaching, and gym discovery easier
              for people across Rwanda.
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />

            <h2 className="text-lg font-semibold text-zinc-900">
              Our Vision
            </h2>

            <p className="mt-3 text-sm leading-7 text-zinc-600">
              To become a leading digital fitness platform connecting coaches,
              gyms, and fitness communities in Rwanda.
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />

            <h2 className="text-lg font-semibold text-zinc-900">
              Our Community
            </h2>

            <p className="mt-3 text-sm leading-7 text-zinc-600">
              RwandaFitness supports beginners, athletes, coaches, and gym
              owners who want to build a stronger fitness culture.
            </p>
          </article>
        </section>

        <section className="mt-12 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
          <h2 className="text-2xl font-bold text-zinc-900">
            What you can find on RwandaFitness
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item) => (
              <div
                key={item}
                className="rounded-xl bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700"
              >
                <span aria-hidden="true">✔</span> {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl bg-primary px-8 py-12 text-center text-white shadow-sm">
          <h2 className="text-3xl font-bold tracking-tight">
            Fitness is a better life.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
            RwandaFitness was created to help more people access fitness
            resources, connect with coaches, and discover gyms across Rwanda.
          </p>

          <p className="mt-6 text-sm font-semibold text-white/90">
            Founded by Jean Claude Muhinyuzi
          </p>
        </section>
      </main>
    </div>
  );
}