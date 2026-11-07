"use client";

import {ChangeEvent, FormEvent, useState} from "react";
import {useTranslations} from "next-intl";

import {Link, useRouter} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type RegisterForm = {
  email: string;
  username: string;
  full_name: string;
  phone: string;
  role: "client" | "coach";
  password: string;
  password_confirm: string;
};

type ErrorResponse = Record<string, unknown>;

export default function RegisterPage() {
  const t = useTranslations("Register");
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    email: "",
    username: "",
    full_name: "",
    phone: "",
    role: "client",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const {name, value} = event.target;
    setForm((previous) => ({...previous, [name]: value}));
  };

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const getErrorMessage = (data: unknown) => {
    if (!data || typeof data !== "object") {
      return t("messages.registrationFailed");
    }

    const messages = Object.values(data as ErrorResponse)
      .flatMap((value) => {
        if (Array.isArray(value)) return value.map(String);
        if (typeof value === "string") return [value];
        if (value && typeof value === "object") {
          return Object.values(value).flat().map(String);
        }
        return [];
      })
      .filter(Boolean);

    return messages.length > 0
      ? messages.join(" ")
      : t("messages.registrationFailed");
  };

  const handleRegister = async () => {
    if (loading) return;
    setError("");

    const email = form.email.trim().toLowerCase();
    const username = form.username.trim();
    const fullName = form.full_name.trim();
    const phone = form.phone.trim();

    if (!email || !username || !fullName || !form.password || !form.password_confirm) {
      setError(t("messages.requiredFields"));
      return;
    }
    if (!isValidEmail(email)) {
      setError(t("messages.invalidEmail"));
      return;
    }
    if (username.length < 3) {
      setError(t("messages.usernameTooShort"));
      return;
    }
    if (fullName.length < 2) {
      setError(t("messages.fullNameTooShort"));
      return;
    }
    if (form.password.length < 8) {
      setError(t("messages.passwordTooShort"));
      return;
    }
    if (form.password !== form.password_confirm) {
      setError(t("messages.passwordMismatch"));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/auth/register/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email,
          username,
          full_name: fullName,
          phone,
          role: form.role,
          password: form.password,
          password_confirm: form.password_confirm,
        }),
      });

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        setError(getErrorMessage(data));
        return;
      }

      router.replace(`/check-email?email=${encodeURIComponent(email)}`);
    } catch {
      setError(t("messages.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleRegister();
  };

  const inputClass =
    "w-full rounded-2xl border border-[#D5E8DB] bg-white px-4 py-3.5 text-sm text-[#17251E] outline-none transition placeholder:text-[#80968A] focus:border-[#007D36] focus:ring-4 focus:ring-[#007D36]/10 disabled:cursor-not-allowed disabled:bg-[#F3FAF6]";

  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center bg-[#F3FAF6] px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-[#DCEDE2] bg-white shadow-[0_24px_80px_rgba(0,61,36,0.09)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-[#003D24] px-10 py-14 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border-[65px] border-[#00CFFF]/10" />
          <div className="pointer-events-none absolute -bottom-32 -left-28 h-96 w-96 rounded-full bg-[#007D36]/50 blur-3xl" />
          <div className="relative">
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#FFD21A]">
              <span className="h-2 w-2 rounded-full bg-[#00CFFF]" />
              RwandaFitness
            </div>
            <h2 className="max-w-sm text-4xl font-black leading-tight tracking-tight">
              {t("title")}
            </h2>
            <p className="mt-6 max-w-sm text-base leading-8 text-white/75">
              {t("description")}
            </p>
          </div>
          <div className="relative flex items-center gap-3 border-t border-white/15 pt-7">
            <div className="h-1 w-14 rounded-full bg-[#FFD21A]" />
            <div className="h-1 w-7 rounded-full bg-[#00CFFF]" />
            <div className="h-1 w-4 rounded-full bg-white/40" />
          </div>
        </aside>

        <section className="px-5 py-8 sm:px-10 sm:py-12 lg:px-14">
          <div className="mb-7 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#007D36]">
              RwandaFitness
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#003D24]">
              {t("title")}
            </h1>
            <p className="mt-3 text-sm leading-7 text-[#52675B]">
              {t("description")}
            </p>
          </div>
          <h1 className="mb-2 hidden text-3xl font-black tracking-tight text-[#003D24] lg:block">
            {t("title")}
          </h1>
          <div className="mb-7 hidden h-1 w-16 rounded-full bg-[#00CFFF] lg:block" />

          {error && (
            <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="email"
                type="email"
                autoComplete="email"
                aria-label={t("fields.email")}
                placeholder={t("fields.email")}
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                required
                className={inputClass}
              />
              <input
                name="username"
                type="text"
                autoComplete="username"
                aria-label={t("fields.username")}
                placeholder={t("fields.username")}
                value={form.username}
                onChange={handleChange}
                disabled={loading}
                minLength={3}
                required
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="full_name"
                type="text"
                autoComplete="name"
                aria-label={t("fields.fullName")}
                placeholder={t("fields.fullName")}
                value={form.full_name}
                onChange={handleChange}
                disabled={loading}
                minLength={2}
                required
                className={inputClass}
              />
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                aria-label={t("fields.phone")}
                placeholder={t("fields.phone")}
                value={form.phone}
                onChange={handleChange}
                disabled={loading}
                className={inputClass}
              />
            </div>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={loading}
              aria-label={t("fields.role")}
              className={inputClass}
            >
              <option value="client">{t("roles.client")}</option>
              <option value="coach">{t("roles.coach")}</option>
            </select>

            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                aria-label={t("fields.password")}
                placeholder={t("fields.password")}
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                minLength={8}
                required
                className={`${inputClass} pr-14`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#52675B] transition hover:bg-[#EAF5EE] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007D36] disabled:opacity-50"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.2A10.9 10.9 0 0 1 12 5c5 0 9 4 10 7a13.4 13.4 0 0 1-3.2 4.4M6.1 6.1C4.1 7.4 2.7 9.4 2 12c1 3 5 7 10 7 1.3 0 2.5-.3 3.6-.8" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
            <p className="-mt-2 text-xs text-[#52675B]">{t("passwordHelp")}</p>
            <input
              name="password_confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-label={t("fields.confirmPassword")}
              placeholder={t("fields.confirmPassword")}
              value={form.password_confirm}
              onChange={handleChange}
              disabled={loading}
              minLength={8}
              required
              className={inputClass}
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-[#FFD21A] px-5 py-4 text-sm font-bold text-[#003D24] shadow-[0_8px_22px_rgba(255,210,26,0.2)] transition hover:bg-[#F4C900] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007D36] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t("creatingAccount") : t("register")}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-[#52675B]">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="font-bold text-[#007D36] underline-offset-4 hover:underline">
              {t("login")}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
