"use client";

import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";

export default function EmailVerifiedPage() {
  const t = useTranslations("EmailVerified");

  return (
    <main className="relative isolate flex min-h-[85vh] items-center justify-center overflow-hidden bg-[#F3FAF6] px-4 py-16 sm:px-6 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-36 h-96 w-96 rounded-full bg-[#00CFFF]/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#007D36]/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#003D24] via-[#00CFFF] to-[#FFD21A]" />
      </div>

      <section className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#075C38]/10 bg-white shadow-[0_24px_90px_rgba(0,61,36,0.12)]">
        <div className="relative overflow-hidden bg-[#003D24] px-7 pb-16 pt-12 text-center sm:px-12 sm:pt-14">
          <div aria-hidden="true" className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#00CFFF]/10 blur-2xl" />
          <span className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#FFD21A]" />
            RwandaFitness
          </span>
          <h1 className="relative mt-7 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h1>
        </div>

        <div className="relative -mt-10 px-6 pb-10 text-center sm:px-12 sm:pb-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] border-[6px] border-white bg-[#FFD21A] text-[#003D24] shadow-lg shadow-[#003D24]/10 sm:h-24 sm:w-24" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 sm:h-12 sm:w-12">
              <path d="m5 12 4.5 4.5L19 7" />
            </svg>
          </div>

          <p className="mx-auto mt-7 max-w-lg text-lg font-semibold leading-8 text-[#17251E] sm:text-xl">
            {t("description")}
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#567064] sm:text-base">
            {t("details")}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#FFD21A] px-8 py-3 text-sm font-extrabold text-[#003D24] shadow-[0_6px_20px_rgba(255,210,26,0.2)] transition hover:-translate-y-0.5 hover:bg-[#ffe052] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075C38]">
              {t("login")}
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#075C38]/20 bg-white px-8 py-3 text-sm font-bold text-[#075C38] transition hover:-translate-y-0.5 hover:bg-[#F3FAF6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075C38]">
              {t("home")}
            </Link>
          </div>

          <div className="mt-10 border-t border-[#075C38]/10 pt-6 text-sm leading-6 text-[#668073]">
            {t("footer")}
          </div>
        </div>
      </section>
    </main>
  );
}
