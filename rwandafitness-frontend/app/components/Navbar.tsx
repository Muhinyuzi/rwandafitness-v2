"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-zinc-900">
          RwandaFitness
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-zinc-700">
          <Link href="/coaches" className="transition hover:text-black">
            Coaches
          </Link>

          <Link href="/gyms" className="transition hover:text-black">
            Gyms
          </Link>

          <Link href="/my-requests" className="transition hover:text-black">
            My Requests
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {!token ? (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}