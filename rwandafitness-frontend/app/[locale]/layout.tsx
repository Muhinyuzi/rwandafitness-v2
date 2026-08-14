import type {Metadata} from "next";
import type {ReactNode} from "react";
import Image from "next/image";
import {Geist, Geist_Mono} from "next/font/google";
import {NextIntlClientProvider, hasLocale} from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import {notFound} from "next/navigation";

import "../globals.css";

import Navbar from "@/components/Navbar";
import {Link} from "@/i18n/navigation";
import {routing} from "@/i18n/routing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type LocaleParams = {
  locale: string;
};

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<LocaleParams>;
};

type MetadataProps = {
  params: Promise<LocaleParams>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({
    locale,
    namespace: "Metadata",
  });

  return {
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },

    description: t("description"),

    icons: {
      icon: [
        {
          url: "/favicon.ico",
        },
        {
          url: "/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png",
        },
        {
          url: "/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
      ],

      apple: [
        {
          url: "/apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },

    manifest: "/site.webmanifest",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations("Layout");

  const currentYear = new Date().getFullYear();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1">
              <div className="mx-auto w-full max-w-6xl px-6 py-6">
                {children}
              </div>
            </main>

            <footer className="border-t border-zinc-200 bg-white">
              <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-8 text-sm text-zinc-600 md:flex-row">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center gap-3 md:justify-start">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm">
                      <Image
                        src="/rwandafitness-icon.png"
                        alt="RwandaFitness"
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-primary">
                        RwandaFitness
                      </h3>

                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        Stronger • Better • Life
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 font-semibold text-zinc-800">
                    Q.E.D. — {t("footer.qed")}
                  </p>

                  <p className="mt-1">
                    {t("footer.description")}
                  </p>
                </div>

                <nav
                  aria-label={t("footer.navigationLabel")}
                  className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
                >
                  <Link
                    href="/articles"
                    className="transition hover:text-primary"
                  >
                    {t("footer.links.articles")}
                  </Link>

                  <Link
                    href="/coaches"
                    className="transition hover:text-primary"
                  >
                    {t("footer.links.coaches")}
                  </Link>

                  <Link
                    href="/gyms"
                    className="transition hover:text-primary"
                  >
                    {t("footer.links.gyms")}
                  </Link>

                  <Link
                    href="/about"
                    className="transition hover:text-primary"
                  >
                    {t("footer.links.about")}
                  </Link>
                </nav>
              </div>

              <div className="border-t border-zinc-100 px-6 py-4 text-center text-xs text-zinc-500">
                {t("footer.copyright", {
                  startYear: 2019,
                  currentYear,
                })}
              </div>
            </footer>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}