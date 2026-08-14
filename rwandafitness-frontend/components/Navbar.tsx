"use client";

import Image from "next/image";
import {useLocale, useTranslations} from "next-intl";
import {useEffect, useState} from "react";

import {
  Link,
  usePathname,
  useRouter,
} from "@/i18n/navigation";
import {API_URL} from "@/lib/api";

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

type SupportedLocale = "en" | "rw";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const locale = useLocale() as SupportedLocale;

  const router = useRouter();
  const pathname = usePathname();

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
        const response = await fetch(
          `${API_URL}/api/auth/me/`,
          {
            headers: {
              Authorization: `Token ${storedToken}`,
            },
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");

          setToken(null);
          setUser(null);

          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load the current user.",
          );
        }

        const data: User = await response.json();

        if (!controller.signal.aborted) {
          setToken(storedToken);
          setUser(data);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
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
      void loadCurrentUser();
    };

    void loadCurrentUser();

    window.addEventListener(
      "auth-changed",
      handleAuthChange,
    );

    window.addEventListener(
      "storage",
      handleAuthChange,
    );

    return () => {
      controller?.abort();

      window.removeEventListener(
        "auth-changed",
        handleAuthChange,
      );

      window.removeEventListener(
        "storage",
        handleAuthChange,
      );
    };
  }, []);

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLocaleChange = (
    nextLocale: SupportedLocale,
  ) => {
    if (nextLocale === locale) {
      return;
    }

    setMobileMenuOpen(false);

    const isArticleDetailPage =
      pathname.startsWith("/articles/") &&
      pathname !== "/articles";

    const destination = isArticleDetailPage
      ? "/articles"
      : pathname;

    router.replace(destination, {
      locale: nextLocale,
    });
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

    window.dispatchEvent(
      new Event("auth-changed"),
    );

    router.replace("/login");
    router.refresh();
  };

  const getInitials = () => {
    if (!user) {
      return "U";
    }

    const displayValue =
      user.full_name?.trim() ||
      user.username?.trim() ||
      user.email;

    const parts = displayValue
      .split(/[\s._-]+/)
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return displayValue
      .slice(0, 2)
      .toUpperCase();
  };

  const getDisplayName = () => {
    if (!user) {
      return "";
    }

    if (user.full_name?.trim()) {
      return user.full_name.trim();
    }

    if (user.username?.trim()) {
      return user.username.trim();
    }

    return (
      user.email.split("@")[0] ||
      user.email
    );
  };

  const formatRole = (
    role: User["role"],
  ) => {
    return t(`roles.${role}`);
  };

  const mobileLinkClasses =
    "block rounded-lg px-4 py-3 text-sm font-semibold uppercase text-white transition hover:bg-white/10 hover:text-accent";

  const languageButtonClasses = (
    buttonLocale: SupportedLocale,
  ) =>
    `rounded-md px-2 py-1 text-xs font-bold transition ${
      locale === buttonLocale
        ? "bg-white text-primary"
        : "text-white hover:bg-white/10"
    }`;

  const mobileLanguageButtonClasses = (
    buttonLocale: SupportedLocale,
  ) =>
    `rounded-lg px-4 py-3 text-sm font-semibold transition ${
      locale === buttonLocale
        ? "bg-white text-primary"
        : "border border-white/30 text-white hover:bg-white/10"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-primary text-white shadow-sm">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 xl:flex-none"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-md transition-transform hover:scale-105 sm:h-12 sm:w-12">
            <Image
              src="/rwandafitness-icon.png"
              alt="RwandaFitness"
              fill
              priority
              sizes="48px"
              className="object-contain"
            />
          </div>

          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-lg font-extrabold tracking-tight text-white sm:text-2xl">
              RwandaFitness
            </span>

            <span className="mt-1 truncate text-[7px] uppercase tracking-[0.18em] text-white/75 min-[380px]:text-[8px] min-[380px]:tracking-[0.22em] sm:text-[10px] sm:tracking-[0.25em]">
              {t("tagline")}
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-4 text-sm font-semibold uppercase xl:flex">
          <Link
            href="/articles"
            className="transition hover:text-accent"
          >
            {t("articles")}
          </Link>

          <Link
            href="/coaches"
            className="transition hover:text-accent"
          >
            {t("coaches")}
          </Link>

          <Link
            href="/gyms"
            className="transition hover:text-accent"
          >
            {t("gyms")}
          </Link>

          <Link
            href="/about"
            className="transition hover:text-accent"
          >
            {t("about")}
          </Link>

          <Link
            href="/contact"
            className="transition hover:text-accent"
          >
            {t("contact")}
          </Link>

          {user?.role === "client" && (
            <Link
              href="/my-requests"
              className="transition hover:text-accent"
            >
              {t("myRequests")}
            </Link>
          )}

          {user?.role === "coach" && (
            <Link
              href="/my-requests"
              className="transition hover:text-accent"
            >
              {t("clientRequests")}
            </Link>
          )}

          {token && (
            <Link
              href="/dashboard"
              className="transition hover:text-accent"
            >
              {t("dashboard")}
            </Link>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            className="hidden items-center rounded-lg border border-white/20 p-1 xl:flex"
            aria-label={t("language")}
          >
            <button
              type="button"
              onClick={() =>
                handleLocaleChange("en")
              }
              aria-pressed={locale === "en"}
              className={languageButtonClasses(
                "en",
              )}
            >
              EN
            </button>

            <button
              type="button"
              onClick={() =>
                handleLocaleChange("rw")
              }
              aria-pressed={locale === "rw"}
              className={languageButtonClasses(
                "rw",
              )}
            >
              RW
            </button>
          </div>

          {!token ? (
            <div className="hidden items-center gap-3 xl:flex">
              <Link
                href="/login"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {t("login")}
              </Link>

              <Link
                href="/register"
                className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t("register")}
              </Link>
            </div>
          ) : (
            <div className="hidden items-center gap-2 xl:flex">
              {!loadingUser && user && (
                <Link
                  href="/dashboard"
                  title={user.email}
                  className="flex max-w-56 min-w-0 items-center gap-2 rounded-xl bg-white/10 px-3 py-2 transition hover:bg-white/15"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                    {getInitials()}
                  </div>

                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold normal-case text-white">
                      {getDisplayName()}
                    </p>

                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                        {formatRole(user.role)}
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut
                  ? t("loggingOut")
                  : t("logout")}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (current) => !current,
              )
            }
            aria-label={
              mobileMenuOpen
                ? t("closeMenu")
                : t("openMenu")
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 transition hover:bg-white/10 xl:hidden"
          >
            <span className="sr-only">
              {mobileMenuOpen
                ? t("closeMenu")
                : t("openMenu")}
            </span>

            <div className="flex w-5 flex-col gap-1.5">
              <span
                className={`h-0.5 w-full bg-white transition ${
                  mobileMenuOpen
                    ? "translate-y-2 rotate-45"
                    : ""
                }`}
              />

              <span
                className={`h-0.5 w-full bg-white transition ${
                  mobileMenuOpen
                    ? "opacity-0"
                    : ""
                }`}
              />

              <span
                className={`h-0.5 w-full bg-white transition ${
                  mobileMenuOpen
                    ? "-translate-y-2 -rotate-45"
                    : ""
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-white/10 bg-primary px-4 pb-5 pt-3 shadow-lg xl:hidden"
        >
          <div className="mx-auto max-w-6xl">
            {token && loadingUser && (
              <div className="mb-3 rounded-xl bg-white/10 p-3 text-sm text-white/70">
                {t("loadingAccount")}
              </div>
            )}

            {token &&
              !loadingUser &&
              user && (
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="mb-3 flex items-center gap-3 rounded-xl bg-white/10 p-3 transition hover:bg-white/15"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                    {getInitials()}
                  </div>

                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-semibold normal-case text-white"
                      title={user.email}
                    >
                      {getDisplayName()}
                    </p>

                    <div className="mt-1">
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                        {formatRole(user.role)}
                      </span>
                    </div>
                  </div>
                </Link>
              )}

            <div className="space-y-1">
              <Link
                href="/articles"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                {t("articles")}
              </Link>

              <Link
                href="/coaches"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                {t("coaches")}
              </Link>

              <Link
                href="/gyms"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                {t("gyms")}
              </Link>

              <Link
                href="/about"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                {t("about")}
              </Link>

              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                {t("contact")}
              </Link>

              {user?.role === "client" && (
                <Link
                  href="/my-requests"
                  onClick={closeMobileMenu}
                  className={mobileLinkClasses}
                >
                  {t("myRequests")}
                </Link>
              )}

              {user?.role === "coach" && (
                <Link
                  href="/my-requests"
                  onClick={closeMobileMenu}
                  className={mobileLinkClasses}
                >
                  {t("clientRequests")}
                </Link>
              )}

              {token && (
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className={mobileLinkClasses}
                >
                  {t("dashboard")}
                </Link>
              )}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                {t("language")}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleLocaleChange("en")
                  }
                  aria-pressed={locale === "en"}
                  className={mobileLanguageButtonClasses(
                    "en",
                  )}
                >
                  EN
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleLocaleChange("rw")
                  }
                  aria-pressed={locale === "rw"}
                  className={mobileLanguageButtonClasses(
                    "rw",
                  )}
                >
                  RW
                </button>
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              {!token ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="rounded-lg bg-accent px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    {t("login")}
                  </Link>

                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="rounded-lg border border-white/30 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {t("register")}
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingOut
                    ? t("loggingOut")
                    : t("logout")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}