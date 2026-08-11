"use client";

import {Suspense} from "react";
import {useSearchParams} from "next/navigation";
import {useTranslations} from "next-intl";

import {Link} from "@/i18n/navigation";

function CheckEmailContent() {
  const t = useTranslations("CheckEmail");
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
          📧
        </div>

        <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
          {t("title")}
        </h1>

        <p className="text-sm leading-6 text-zinc-600">
          {t("accountCreated")}
        </p>

        {email && (
          <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-xs text-zinc-500">
              {t("verificationSent")}
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-zinc-900">
              {email}
            </p>
          </div>
        )}

        <p className="mt-5 text-sm leading-6 text-zinc-600">
          {t("instructions")}
        </p>

        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
          <p className="text-sm font-medium text-amber-900">
            {t("notReceivedTitle")}
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            {t("notReceivedDescription")}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            {t("goToLogin")}
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            {t("useAnotherEmail")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function CheckEmailLoading() {
  const t = useTranslations("CheckEmail");

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <p className="text-sm text-zinc-600">
        {t("loading")}
      </p>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<CheckEmailLoading />}>
      <CheckEmailContent />
    </Suspense>
  );
}