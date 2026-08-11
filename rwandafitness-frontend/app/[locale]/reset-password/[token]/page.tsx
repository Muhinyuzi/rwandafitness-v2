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
    if (loading) {
      return;
    }

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
        `${API_URL}/api/auth/reset-password/${token}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await handleReset();
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />

        <h1 className="text-3xl font-bold text-zinc-900">
          {t("title")}
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {t("description")}
        </p>

        {message && (
          <div
            role="alert"
            className={`mt-6 rounded-xl border p-3 text-sm ${
              isSuccess
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder={t("fields.newPassword")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading || isSuccess}
            minLength={8}
            required
            className="mt-6 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-100"
          />

          <p className="mt-2 text-xs text-zinc-500">
            {t("passwordHelp")}
          </p>

          <input
            type="password"
            name="password_confirm"
            autoComplete="new-password"
            placeholder={t("fields.confirmPassword")}
            value={passwordConfirm}
            onChange={(event) =>
              setPasswordConfirm(event.target.value)
            }
            disabled={loading || isSuccess}
            minLength={8}
            required
            className="mt-4 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-100"
          />

          <button
            type="submit"
            disabled={loading || isSuccess}
            className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? t("saving") : t("savePassword")}
          </button>
        </form>

        {isSuccess && (
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-primary transition hover:underline"
            >
              {t("login")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}