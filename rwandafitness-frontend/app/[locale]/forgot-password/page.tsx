"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { API_URL } from "@/lib/api";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setMessage(t("messages.emailRequired"));
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          typeof data.detail === "string"
            ? data.detail
            : t("messages.unexpectedError")
        );
        return;
      }

      setMessage(data.detail || t("messages.success"));
      setEmail("");
    } catch {
      setMessage(t("messages.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />

        <h1 className="text-3xl font-bold text-zinc-900">
          {t("title")}
        </h1>

        <p className="mt-2 text-zinc-600">
          {t("description")}
        </p>

        {message && (
          <div className="mt-6 rounded-xl bg-zinc-100 p-3 text-sm">
            {message}
          </div>
        )}

        <input
          type="email"
          placeholder={t("emailPlaceholder")}
          className="mt-6 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-primary"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-70"
        >
          {loading ? t("sending") : t("send")}
        </button>
      </div>
    </div>
  );
}