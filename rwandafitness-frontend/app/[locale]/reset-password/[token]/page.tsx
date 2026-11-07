"use client";

import {FormEvent, useState} from "react";
import {useTranslations} from "next-intl";
import {useParams} from "next/navigation";

import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type ResetPasswordResponse = {
  detail?: string;
};

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPassword");
  const params = useParams<{token: string}>();
  const token = params.token;

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (loading || isSuccess) return;

    setMessage("");
    setIsSuccess(false);

    if (!password || !passwordConfirm) {
      setMessage(t("messages.requiredFields"));
      return;
    }

    if (password.length < 8) {
      setMessage(t("messages.passwordTooShort"));
      return;
    }

    if (password !== passwordConfirm) {
      setMessage(t("messages.passwordMismatch"));
      return;
    }

    if (!token) {
      setMessage(t("messages.invalidToken"));
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/reset-password/${encodeURIComponent(token)}/`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            password,
            password_confirm: passwordConfirm,
          }),
        }
      );

      let data: ResetPasswordResponse = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        setMessage(data.detail || t("messages.resetFailed"));
        return;
      }

      setIsSuccess(true);
      setMessage(data.detail || t("messages.resetSuccess"));
      setPassword("");
      setPasswordConfirm("");
    } catch {
      setMessage(t("messages.resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleReset();
  };

  return (
    <main className="relative flex min-h-[80vh] flex-1 items-center justify-center overflow-hidden bg-[#F3FAF6] px-4 py-12 sm:px-6 lg:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-[#00CFFF]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#007D36]/10 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-[#DCEDE2] bg-white shadow-[0_24px_80px_rgba(0,61,36,0.10)] lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative hidden min-h-[540px] flex-col justify-between overflow-hidden bg-[#003D24] p-10 text-white lg:flex">
          <div aria-hidden="true" className="absolute -right-28 top-20 h-72 w-72 rounded-full border-[45px] border-[#00CFFF]/15" />
          <div aria-hidden="true" className="absolute -bottom-36 -left-20 h-80 w-80 rounded-full border-[55px] border-[#FFD21A]/15" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FFD21A]">
              <span className="h-2 w-2 rounded-full bg-[#00CFFF]" />
              RwandaFitness
            </span>
          </div>
          <div className="relative space-y-5">
            <div className="h-1.5 w-16 rounded-full bg-[#FFD21A]" />
            <div className="text-5xl font-black leading-tight tracking-[-0.05em]">
              Rwanda<span className="text-[#00CFFF]">Fitness</span>
            </div>
            <div className="h-px w-24 bg-white/30" />
            <div className="flex gap-2" aria-hidden="true">
              <span className="h-2 w-10 rounded-full bg-[#FFD21A]" />
              <span className="h-2 w-6 rounded-full bg-[#00CFFF]" />
              <span className="h-2 w-4 rounded-full bg-white/40" />
            </div>
          </div>
          <div className="relative text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            RwandaFitness
          </div>
        </aside>

        <section className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
          <div className="mb-7 h-1.5 w-16 rounded-full bg-[#00CFFF]" />
          <h1 className="text-3xl font-black tracking-[-0.04em] text-[#003D24] sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[#52675B]">
            {t("description")}
          </p>

          {message && (
            <div
              role="alert"
              aria-live="polite"
              className={`mt-7 rounded-2xl border px-4 py-4 text-sm leading-6 ${
                isSuccess
                  ? "border-[#BDE8CE] bg-[#EAF8F0] text-[#075C38]"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-[#17251E]">
                  {t("fields.newPassword")}
                </label>
                <input
                  id="new-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder={t("fields.newPassword")}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  minLength={8}
                  required
                  className="w-full rounded-2xl border border-[#DCEDE2] bg-[#F9FCFA] px-4 py-3.5 text-sm text-[#17251E] outline-none transition placeholder:text-[#84988B] focus:border-[#007D36] focus:ring-4 focus:ring-[#00CFFF]/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="mt-2 text-xs leading-5 text-[#52675B]">
                  {t("passwordHelp")}
                </p>
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-[#17251E]">
                  {t("fields.confirmPassword")}
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  name="password_confirm"
                  autoComplete="new-password"
                  placeholder={t("fields.confirmPassword")}
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  disabled={loading}
                  minLength={8}
                  required
                  className="w-full rounded-2xl border border-[#DCEDE2] bg-[#F9FCFA] px-4 py-3.5 text-sm text-[#17251E] outline-none transition placeholder:text-[#84988B] focus:border-[#007D36] focus:ring-4 focus:ring-[#00CFFF]/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#FFD21A] px-5 py-3.5 text-sm font-extrabold text-[#003D24] shadow-[0_8px_24px_rgba(255,210,26,0.22)] transition hover:bg-[#F5C700] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00CFFF]/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t("saving") : t("savePassword")}
              </button>
            </form>
          )}

          {isSuccess && (
            <Link
              href="/login"
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-[#FFD21A] px-5 py-3.5 text-sm font-extrabold text-[#003D24] transition hover:bg-[#F5C700] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00CFFF]/40"
            >
              {t("login")}
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
