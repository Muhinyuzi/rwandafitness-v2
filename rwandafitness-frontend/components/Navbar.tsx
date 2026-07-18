"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

type User = {
  id: number;
  email: string;
  username: string;
  full_name: string;
  phone: string;
  role: "client" | "coach" | "admin";
  is_active: boolean;
  created_at: string;
};

export default function Navbar() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let controller: AbortController | null = null;

    const loadCurrentUser = async () => {
      controller?.abort();
      controller = new AbortController();

      const storedToken = localStorage.getItem("token");

      setToken(storedToken);
      setLoadingUser(true);
      setLoggingOut(false);

      if (!storedToken) {
        setUser(null);
        setLoadingUser(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me/`, {
          headers: {
            Authorization: `Token ${storedToken}`,
          },
          signal: controller.signal,
          cache: "no-store",
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");

          setToken(null);
          setUser(null);
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load the current user.");
        }

        const data: User = await response.json();

        if (!controller.signal.aborted) {
          setToken(storedToken);
          setUser(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        setToken(null);
        setUser(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingUser(false);
        }
      }
    };

    const handleAuthChange = () => {
      loadCurrentUser();
    };

    loadCurrentUser();

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      controller?.abort();

      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    setMobileMenuOpen(false);

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setLoadingUser(false);

    window.dispatchEvent(new Event("auth-changed"));

    router.replace("/login");
    router.refresh();
  };

  const getInitials = () => {
    if (!user?.email) {
      return "U";
    }

    const emailName = user.email.split("@")[0];

    if (!emailName) {
      return "U";
    }

    const parts = emailName
      .split(/[._-]+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return emailName.slice(0, 2).toUpperCase();
  };

  const formatRole = (role: User["role"]) => {
    if (role === "coach") {
      return "Coach";
    }

    if (role === "client") {
      return "Client";
    }

    return "Admin";
  };

  const mobileLinkClasses =
    "block rounded-lg px-4 py-3 text-sm font-semibold uppercase text-white transition hover:bg-white/10 hover:text-accent";

  return (
    <nav className="sticky top-0 z-50 bg-primary text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:flex-none"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-md transition-transform hover:scale-105 sm:h-12 sm:w-12">
            <span className="text-xl font-black tracking-tighter sm:text-2xl">
              <span className="text-cyan-500">R</span>
              <span className="text-slate-900">F</span>
            </span>
          </div>

          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-lg font-extrabold tracking-tight text-white sm:text-2xl">
              RwandaFitness
            </span>

            <span className="mt-1 truncate text-[7px] uppercase tracking-[0.18em] text-white/75 min-[380px]:text-[8px] min-[380px]:tracking-[0.22em] sm:text-[10px] sm:tracking-[0.25em]">
              Stronger • Better • Life
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold uppercase lg:flex">
          <Link href="/articles" className="transition hover:text-accent">
            Articles
          </Link>

          <Link href="/coaches" className="transition hover:text-accent">
            Coaches
          </Link>

          <Link href="/gyms" className="transition hover:text-accent">
            Gyms
          </Link>

          <Link href="/about" className="transition hover:text-accent">
            About
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {!token ? (
            <div className="hidden items-center gap-3 lg:flex">
              <Link
                href="/login"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="hidden items-center gap-3 lg:flex">
              {!loadingUser && user && (
                <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/10 px-3 py-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                    {getInitials()}
                  </div>

                  <div className="min-w-0 leading-tight">
                    <p
                      className="max-w-44 truncate text-sm font-semibold normal-case text-white"
                      title={user.email}
                    >
                      {user.email}
                    </p>

                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                      {formatRole(user.role)}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 transition hover:bg-white/10 lg:hidden"
          >
            <span className="sr-only">
              {mobileMenuOpen ? "Close menu" : "Open menu"}
            </span>

            <div className="flex w-5 flex-col gap-1.5">
              <span
                className={`h-0.5 w-full bg-white transition ${
                  mobileMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />

              <span
                className={`h-0.5 w-full bg-white transition ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />

              <span
                className={`h-0.5 w-full bg-white transition ${
                  mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-white/10 bg-primary px-4 pb-5 pt-3 shadow-lg lg:hidden"
        >
          <div className="mx-auto max-w-6xl">
            {token && loadingUser && (
              <div className="mb-3 rounded-xl bg-white/10 p-3 text-sm text-white/70">
                Loading account...
              </div>
            )}

            {token && !loadingUser && user && (
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/10 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                  {getInitials()}
                </div>

                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-semibold normal-case text-white"
                    title={user.email}
                  >
                    {user.email}
                  </p>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-accent">
                    {formatRole(user.role)}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Link
                href="/articles"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                Articles
              </Link>

              <Link
                href="/coaches"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                Coaches
              </Link>

              <Link
                href="/gyms"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                Gyms
              </Link>

              <Link
                href="/about"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                About
              </Link>

              {user?.role === "client" && (
                <Link
                  href="/my-requests"
                  onClick={closeMobileMenu}
                  className={mobileLinkClasses}
                >
                  My Requests
                </Link>
              )}

              {user?.role === "coach" && (
                <Link
                  href="/my-requests"
                  onClick={closeMobileMenu}
                  className={mobileLinkClasses}
                >
                  Client Requests
                </Link>
              )}

              {token && (
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className={mobileLinkClasses}
                >
                  Dashboard
                </Link>
              )}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              {!token ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="rounded-lg bg-accent px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="rounded-lg border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}