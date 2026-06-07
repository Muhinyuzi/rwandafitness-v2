import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
          <footer className="border-t border-zinc-200 bg-white py-6 text-center text-sm text-zinc-500">
            © {new Date().getFullYear()} RwandaFitness. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  );
}