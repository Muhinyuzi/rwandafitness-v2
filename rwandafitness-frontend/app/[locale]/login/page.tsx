"use client";

import {FormEvent, useState} from "react";
import {useTranslations} from "next-intl";

import {Link, useRouter} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type LoginResponse = {
  token?: string;
  detail?: string;
  non_field_errors?: string[];
};

export default function LoginPage() {
  const t = useTranslations("Login");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    setError("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError(t("messages.requiredFields"));
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: normalizedEmail, password}),
      });

      const contentType = response.headers.get("content-type");
      const data: LoginResponse | null = contentType?.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        setError(
          data?.detail ||
            data?.non_field_errors?.[0] ||
            t("messages.invalidCredentials")
        );
        return;
      }

      if (!data?.token) {
        setError(t("messages.missingToken"));
        return;
      }

      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("auth-changed"));
      router.replace("/coaches");
      router.refresh();
    } catch {
      setError(t("messages.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleLogin();
  };

  return (
    <main className="relative flex min-h-[85vh] flex-1 items-center justify-center overflow-hidden bg-[#F3FAF6] px-4 py-10 sm:px-6 lg:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#00CFFF]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#007D36]/10 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-[#DCEDE2] bg-white shadow-[0_30px_90px_rgba(0,61,36,0.10)] lg:min-h-[620px] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#003D24] p-10 text-white lg:flex xl:p-14">
          <div aria-hidden="true" className="absolute -right-28 -top-28 h-80 w-80 rounded-full border-[55px] border-[#00CFFF]/15" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-28 h-96 w-96 rounded-full border-[65px] border-[#FFD21A]/10" />
          <div className="relative">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold tracking-wide">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFD21A] text-xs font-black text-[#003D24]">RF</span>
              RwandaFitness
            </div>
          </div>
          <div className="relative">
            <div className="mb-7 h-1.5 w-16 rounded-full bg-[#FFD21A]" />
            <p className="max-w-sm text-4xl font-black leading-[1.12] tracking-tight xl:text-5xl">
              STRONGER.<br />BETTER.<br /><span className="text-[#00CFFF]">LIFE.</span>
            </p>
            <p className="mt-6 max-w-xs text-sm leading-7 text-white/65">RwandaFitness</p>
          </div>
          <div className="relative flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
            <span className="h-2 w-2 rounded-full bg-[#FFD21A]" />
            RwandaFitness
          </div>
        </section>

        <section className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 xl:px-16">
          <div className="mb-8 lg:hidden">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E5F6EC] px-4 py-2 text-sm font-black text-[#003D24]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFD21A] text-xs">RF</span>
              RwandaFitness
            </span>
          </div>
          <div className="mb-8">
            <div className="mb-5 h-1.5 w-14 rounded-full bg-[#FFD21A]" />
            <h1 className="text-3xl font-black tracking-tight text-[#003D24] sm:text-4xl">{t("title")}</h1>
            <p className="mt-3 max-w-md text-sm leading-7 text-[#52675B]">{t("description")}</p>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-sm font-bold text-[#304A3B]">{t("emailPlaceholder")}</label>
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                required
                className="w-full rounded-2xl border border-[#D4E7DA] bg-[#FAFDFB] px-4 py-3.5 text-sm text-[#17251E] outline-none transition placeholder:text-[#91A59A] focus:border-[#007D36] focus:ring-4 focus:ring-[#007D36]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-sm font-bold text-[#304A3B]">{t("passwordPlaceholder")}</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  required
                  className="w-full rounded-2xl border border-[#D4E7DA] bg-[#FAFDFB] px-4 py-3.5 pr-14 text-sm text-[#17251E] outline-none transition placeholder:text-[#91A59A] focus:border-[#007D36] focus:ring-4 focus:ring-[#007D36]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#52675B] transition hover:text-[#007D36] disabled:opacity-50"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.3A10.6 10.6 0 0 1 12 5c5 0 9 5 9 7a11 11 0 0 1-3.1 3.8M6.1 6.1C4.1 7.4 3 9.5 3 12c0 2 4 7 9 7 1.3 0 2.6-.3 3.7-.8"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              <div className="mt-3 text-right">
                <Link href="/forgot-password" className="text-sm font-bold text-[#007D36] underline-offset-4 hover:underline">{t("forgotPassword")}</Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD21A] px-5 py-3.5 text-sm font-black text-[#003D24] shadow-[0_8px_22px_rgba(255,210,26,0.20)] transition hover:bg-[#F2C400] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD21A]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-[#003D24]/25 border-t-[#003D24]" />}
              {loading ? t("loggingIn") : t("login")}
            </button>
          </form>

          <div className="mt-8 border-t border-[#E2EFE7] pt-6 text-center text-sm text-[#52675B]">
            {t("noAccount")}{" "}
            <Link href="/register" className="font-bold text-[#007D36] underline-offset-4 hover:underline">{t("register")}</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
