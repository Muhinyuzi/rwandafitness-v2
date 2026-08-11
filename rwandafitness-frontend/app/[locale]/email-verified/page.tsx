"use client";

import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

export default function EmailVerifiedPage() {
  const t = useTranslations("EmailVerified");

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <span className="text-4xl">✅</span>
        </div>

        <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
          RwandaFitness
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900">
          {t("title")}
        </h1>

        <p className="mt-6 text-lg leading-8 text-zinc-600">
          {t("description")}
        </p>

        <p className="mt-2 text-zinc-600">
          {t("details")}
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark"
          >
            {t("login")}
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            {t("home")}
          </Link>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-6 text-sm text-zinc-500">
          {t("footer")}
        </div>
      </div>
    </div>
  );
}