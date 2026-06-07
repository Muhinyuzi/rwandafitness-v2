"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  role: "client" | "coach" | "admin";
};

export default function Navbar() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (storedToken) {
      fetch("http://127.0.0.1:8000/api/auth/me/", {
        headers: {
          Authorization: `Token ${storedToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setUser(data))
        .catch(() => {
          setUser(null);
          localStorage.removeItem("token");
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="sticky top-0 z-50 bg-primary text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight transition hover:text-white/90"
        >
          RwandaFitness
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold uppercase md:flex">
          <Link href="/coaches" className="transition hover:text-accent">
            Coaches
          </Link>

          <Link href="/gyms" className="transition hover:text-accent">
            Gyms
          </Link>

          {user?.role === "client" && (
            <Link href="/my-requests" className="transition hover:text-accent">
              My Requests
            </Link>
          )}

          {user?.role === "coach" && (
            <Link href="/my-requests" className="transition hover:text-accent">
              Client Requests
            </Link>
          )}

          {token && (
            <Link href="/dashboard" className="transition hover:text-accent">
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!token ? (
            <>
              <Link
                href="/login"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}