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

  const handleLogin = async () => {
    if (loading) {
      return;
    }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const contentType = response.headers.get("content-type");

      const data: LoginResponse | null = contentType?.includes(
        "application/json"
      )
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

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await handleLogin();
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />

        <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
          {t("title")}
        </h1>

        <p className="mb-6 text-sm text-zinc-600">
          {t("description")}
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            required
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-100"
          />

          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            required
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? t("loggingIn") : t("login")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          {t("noAccount")}{" "}
          <Link
            href="/register"
            className="font-medium text-primary transition hover:underline"
          >
            {t("register")}
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-zinc-600">
          <Link
            href="/forgot-password"
            className="font-medium text-primary transition hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        </p>
      </div>
    </div>
  );
}