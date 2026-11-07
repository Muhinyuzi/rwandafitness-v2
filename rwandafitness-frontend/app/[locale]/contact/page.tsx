"use client";

import {useState, type ChangeEvent, type FormEvent} from "react";
import {useTranslations} from "next-intl";
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

const inputClass =
  "mt-2 w-full rounded-2xl border border-[#DCE8DF] bg-[#F8FBF8] px-4 py-3.5 text-[15px] text-[#17251E] outline-none transition placeholder:text-[#92A398] focus:border-[#007D36] focus:bg-white focus:ring-4 focus:ring-[#007D36]/10 disabled:cursor-not-allowed disabled:opacity-60";

export default function ContactPage() {
  const t = useTranslations("Contact");
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = event.target;
    setForm((current) => ({...current, [name]: value}));
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/api/contact/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        console.error("Contact form validation error:", data);
        throw new Error("Unable to send contact message.");
      }

      setForm(initialForm);
      setSuccessMessage(t("success"));
    } catch (error) {
      console.error("Contact form submission error:", error);
      setErrorMessage(t("error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F3FAF6] pb-20">
      <section className="relative isolate overflow-hidden bg-[#003D24] text-white">
        <div className="pointer-events-none absolute -right-24 -top-40 h-[440px] w-[440px] rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-5 -top-20 h-[300px] w-[300px] rounded-full border border-[#00CFFF]/20" />
        <div className="pointer-events-none absolute bottom-[-140px] left-[-90px] h-[350px] w-[350px] rounded-full bg-[#007D36]/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-28 pt-14 sm:px-8 sm:pb-32 sm:pt-20 lg:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#00CFFF]/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8BEAFF]">
            <span className="h-2 w-2 rounded-full bg-[#FFD21A]" /> RwandaFitness
          </span>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl font-bold italic leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            {t("title")}
            <span className="ml-2 text-[#FFD21A]">.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
            {t("description")}
          </p>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-16 max-w-6xl px-5 sm:px-8">
        <div className="grid overflow-hidden rounded-[32px] border border-[#DCE8DF] bg-white shadow-[0_24px_70px_rgba(0,61,36,0.10)] lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="relative overflow-hidden bg-[#075C38] p-8 text-white sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -bottom-24 -right-28 h-80 w-80 rounded-full border-[45px] border-white/10" />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-[#FFD21A]">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-[#9DECD6]">RwandaFitness</p>
              <h2 className="mt-4 max-w-sm font-serif text-3xl font-bold italic leading-snug sm:text-4xl">
                {t("title")}
              </h2>
              <p className="mt-5 max-w-sm text-sm leading-8 text-white/75">{t("description")}</p>
              <div className="mt-10 h-px bg-white/20" />
              <div className="mt-7 flex items-center gap-3 text-sm font-semibold text-white/90">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFD21A] text-[#003D24]">✓</span>
                RwandaFitness
              </div>
            </div>
          </aside>

          <div className="p-6 sm:p-9 lg:p-12">
            <div className="mb-8">
              <div className="mb-3 h-1 w-12 rounded-full bg-[#FFD21A]" />
              <h2 className="text-2xl font-extrabold tracking-tight text-[#003D24] sm:text-3xl">{t("title")}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-[#234633]">{t("name")}</label>
                  <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required minLength={2} autoComplete="name" disabled={sending} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-[#234633]">{t("email")}</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" disabled={sending} className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-bold text-[#234633]">{t("subject")}</label>
                <input id="subject" name="subject" type="text" value={form.subject} onChange={handleChange} required minLength={3} disabled={sending} className={inputClass} />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-[#234633]">{t("message")}</label>
                <textarea id="message" name="message" value={form.message} onChange={handleChange} required minLength={10} rows={7} disabled={sending} className={`${inputClass} resize-y`} />
              </div>

              {successMessage && (
                <div role="status" aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">{successMessage}</div>
              )}
              {errorMessage && (
                <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{errorMessage}</div>
              )}

              <button type="submit" disabled={sending} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#FFD21A] px-6 py-4 text-sm font-extrabold text-[#003D24] shadow-[0_12px_28px_rgba(255,210,26,0.22)] transition hover:-translate-y-0.5 hover:bg-[#FFE05A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007D36] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto sm:min-w-56">
                {sending ? t("sending") : t("send")}
                {!sending && <span aria-hidden="true" className="text-lg">↗</span>}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
