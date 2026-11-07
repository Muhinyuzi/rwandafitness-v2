"use client";

import {FormEvent, useState} from "react";
import {useLocale, useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

type Feedback = {kind: "success" | "error"; text: string} | null;

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setFeedback({kind: "error", text: t("messages.emailRequired")});
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password/`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: normalizedEmail}),
      });

      const data: unknown = await response.json().catch(() => null);
      const detail =
        data && typeof data === "object" && "detail" in data &&
        typeof data.detail === "string"
          ? data.detail
          : null;

      if (!response.ok) {
        setFeedback({
          kind: "error",
          text: detail || t("messages.unexpectedError"),
        });
        return;
      }

      setFeedback({kind: "success", text: detail || t("messages.success")});
      setEmail("");
    } catch {
      setFeedback({kind: "error", text: t("messages.networkError")});
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-[#F3FAF6] px-4 py-10 text-[#17251E] sm:px-6 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-12 h-80 w-80 rounded-full bg-[#00CFFF]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-[#FFD21A]/15 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#075C38]/10 bg-white shadow-[0_25px_90px_rgba(0,61,36,0.10)] lg:min-h-[610px] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative flex flex-col justify-between overflow-hidden bg-[#003D24] p-8 text-white sm:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[55px] border-[#00CFFF]/15" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 -left-28 h-80 w-80 rounded-full border-[60px] border-[#FFD21A]/10" />

          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3 text-white transition hover:opacity-85" aria-label="RwandaFitness">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFD21A] text-lg font-black tracking-tighter text-[#003D24]">RF</span>
              <span className="text-lg font-black tracking-tight">Rwanda<span className="text-[#00CFFF]">Fitness</span></span>
            </Link>
          </div>

          <div className="relative my-14 lg:my-0">
            <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-white/15 bg-white/10 shadow-inner backdrop-blur-sm">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-[#FFD21A]">
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v3" />
              </svg>
            </div>
            <div className="mb-5 h-1 w-14 rounded-full bg-[#FFD21A]" />
            <h1 className="max-w-sm text-3xl font-black leading-tight tracking-tight sm:text-4xl">{t("title")}</h1>
            <p className="mt-5 max-w-sm text-base leading-8 text-white/75">{t("description")}</p>
          </div>

          <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
            <span className="h-2 w-2 rounded-full bg-[#00CFFF]" />
            RwandaFitness
          </div>
        </aside>

        <section className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14" aria-label={t("title")}>
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F3FAF6] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#075C38]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#007D36]" />
              RwandaFitness
            </div>

            <h2 className="mt-7 text-2xl font-black tracking-tight text-[#003D24] sm:text-3xl">{t("title")}</h2>
            <p className="mt-3 text-sm leading-7 text-[#50665B]">{t("description")}</p>

            {feedback?.kind === "success" ? (
              <div className="mt-9 rounded-2xl border border-[#007D36]/20 bg-[#F3FAF6] p-6" role="status" aria-live="polite">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#007D36] text-white">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="m5 12 4 4L19 6" /></svg>
                </div>
                <p className="mt-4 text-sm font-semibold leading-7 text-[#003D24]">{feedback.text}</p>
                <button type="button" onClick={() => setFeedback(null)} className="mt-5 text-sm font-bold text-[#075C38] underline decoration-[#00CFFF] decoration-2 underline-offset-4 hover:text-[#003D24]">{t("send")}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-9 space-y-5">
                <div>
                  <label htmlFor="forgot-password-email" className="mb-2 block text-sm font-bold text-[#003D24]">{t("emailPlaceholder")}</label>
                  <div className="relative">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6A8275]"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                    <input
                      id="forgot-password-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      required
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (feedback) setFeedback(null);
                      }}
                      placeholder={t("emailPlaceholder")}
                      disabled={loading}
                      aria-invalid={feedback?.kind === "error"}
                      aria-describedby={feedback?.kind === "error" ? "forgot-password-error" : undefined}
                      className="min-h-14 w-full rounded-2xl border border-[#D6E5DA] bg-[#FAFCFA] py-3 pl-12 pr-4 text-sm text-[#17251E] outline-none transition placeholder:text-[#8BA095] focus:border-[#007D36] focus:bg-white focus:ring-4 focus:ring-[#007D36]/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>

                {feedback?.kind === "error" && (
                  <div id="forgot-password-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">{feedback.text}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#FFD21A] px-6 py-3 text-sm font-black text-[#003D24] shadow-[0_10px_24px_rgba(255,210,26,0.20)] transition hover:-translate-y-0.5 hover:bg-[#F4C600] hover:shadow-[0_14px_28px_rgba(255,210,26,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#007D36] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-[#003D24]/25 border-t-[#003D24]" />}
                  {loading ? t("sending") : t("send")}
                  {!loading && <span aria-hidden="true" className="text-lg">→</span>}
                </button>
              </form>
            )}

            <div className="mt-8 border-t border-[#E6EEE8] pt-6">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-[#075C38] transition hover:gap-3 hover:text-[#003D24]">
                <span aria-hidden="true">←</span>
                <span>{locale === "rw" ? "Subira ku kwinjira" : "Back to login"}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
