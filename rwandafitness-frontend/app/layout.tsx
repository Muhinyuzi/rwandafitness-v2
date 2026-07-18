import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RwandaFitness",
  description: "Connect with coaches and start your fitness journey.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <div className="flex min-h-screen flex-col">
          <Navbar />

          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-6 py-6">
              {children}
            </div>
          </main>

          {/* FOOTER SIMPLE */}
          <footer className="border-t border-zinc-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-600 md:flex-row">
              <div>
                <h3 className="text-lg font-bold text-primary">RwandaFitness</h3>
                <p className="mt-1">
                  Discover coaches, gyms and fitness resources across Rwanda.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <Link href="/articles" className="hover:text-primary">
                  Articles
                </Link>

                <Link href="/coaches" className="hover:text-primary">
                  Coaches
                </Link>

                <Link href="/gyms" className="hover:text-primary">
                  Gyms
                </Link>

                <Link href="/about" className="hover:text-primary">
                  About
                </Link>
              </div>
            </div>

            <div className="border-t border-zinc-100 py-4 text-center text-xs text-zinc-500">
              © 2019 - {new Date().getFullYear()} RwandaFitness. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}