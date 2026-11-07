
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
      <body className="min-h-screen bg-[#F3FAF6] text-[#17251E]">
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            {/* ==========================================
                NAVBAR
            ========================================== */}

            <Navbar />

            {/* ==========================================
                MAIN CONTENT
            ========================================== */}

            <main className="flex-1">
              <div className="mx-auto w-full max-w-6xl px-6 py-6">
                {children}
              </div>
            </main>

            {/* ==========================================
                FOOTER
            ========================================== */}

            <footer className="border-t border-[#00CFFF]/20 bg-[#075C38] text-white">
              <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-12">
                {/* BRAND */}

                <div className="max-w-xl">
                  <Link
                    href="/"
                    aria-label="RwandaFitness"
                    className="inline-flex flex-col items-center transition duration-300 hover:opacity-90 sm:items-start"
                  >
                    <Image
                      src="/rwandafitness-logo.png"
                      alt="RwandaFitness"
                      width={320}
                      height={100}
                      sizes="(max-width: 640px) 220px, 280px"
                      className="h-auto w-[220px] object-contain sm:w-[280px]"
                    />

                    <span className="mt-[-6px] text-center text-[8px] font-bold uppercase tracking-[0.24em] text-white/80 sm:ml-8 sm:text-[9px]">
                      STRONGER • BETTER • LIFE
                    </span>
                  </Link>

                  <p className="mt-6 font-serif text-lg font-bold italic text-[#FFD21A]">
                    Q.E.D. — {t("footer.qed")}
                  </p>

                  <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
                    {t("footer.description")}
                  </p>
                </div>

                {/* FOOTER NAVIGATION */}

                <nav
                  aria-label={t("footer.navigationLabel")}
                  className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:justify-end"
                >
                  <Link
                    href="/articles"
                    className="font-serif text-base font-bold italic text-white transition duration-300 hover:text-[#FFD21A]"
                  >
                    {t("footer.links.articles")}
                  </Link>

                  <Link
                    href="/coaches"
                    className="font-serif text-base font-bold italic text-white transition duration-300 hover:text-[#FFD21A]"
                  >
                    {t("footer.links.coaches")}
                  </Link>

                  <Link
                    href="/gyms"
                    className="font-serif text-base font-bold italic text-white transition duration-300 hover:text-[#FFD21A]"
                  >
                    {t("footer.links.gyms")}
                  </Link>

                  <Link
                    href="/about"
                    className="font-serif text-base font-bold italic text-white transition duration-300 hover:text-[#FFD21A]"
                  >
                    {t("footer.links.about")}
                  </Link>
                </nav>
              </div>

              {/* ======================================
                  COPYRIGHT
              ====================================== */}

              <div className="border-t border-white/15 bg-[#064D30] px-6 py-4 text-center text-xs tracking-wide text-white/75">
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
