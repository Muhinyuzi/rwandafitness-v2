"use client";

import {useTranslations} from "next-intl";
import {useState} from "react";

import {API_URL} from "@/lib/api";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialForm: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const t = useTranslations("Contact");

  const [form, setForm] =
    useState<ContactForm>(initialForm);

  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const {name, value} = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (successMessage) {
      setSuccessMessage("");
    }

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (sending) {
      return;
    }

    setSending(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/contact/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            subject: form.subject.trim(),
            message: form.message.trim(),
          }),
        },
      );

      const data = await response.json().catch(
        () => null,
      );

      if (!response.ok) {
        console.error(
          "Contact form validation error:",
          data,
        );

        throw new Error(
          "Unable to send contact message.",
        );
      }

      setForm(initialForm);
      setSuccessMessage(t("success"));
    } catch (error) {
      console.error(
        "Contact form submission error:",
        error,
      );

      setErrorMessage(t("error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {t("title")}
          </h1>

          <p className="mt-3 text-slate-600">
            {t("description")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
        >
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {t("name")}
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              minLength={2}
              autoComplete="name"
              disabled={sending}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {t("email")}
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={sending}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {t("subject")}
            </label>

            <input
              id="subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
              required
              minLength={3}
              disabled={sending}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              {t("message")}
            </label>

            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              minLength={10}
              rows={6}
              disabled={sending}
              className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          {successMessage && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
            >
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending
              ? t("sending")
              : t("send")}
          </button>
        </form>
      </div>
    </main>
  );
}