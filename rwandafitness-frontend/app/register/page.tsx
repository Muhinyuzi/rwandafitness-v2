"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

type RegisterForm = {
  email: string;
  username: string;
  full_name: string;
  phone: string;
  role: "client" | "coach";
  password: string;
  password_confirm: string;
};

type ErrorResponse = Record<string, unknown>;

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    email: "",
    username: "",
    full_name: "",
    phone: "",
    role: "client",
    password: "",
    password_confirm: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const getErrorMessage = (data: unknown) => {
    if (!data || typeof data !== "object") {
      return "Registration failed.";
    }

    const messages = Object.values(data as ErrorResponse)
      .flatMap((value) => {
        if (Array.isArray(value)) {
          return value.map(String);
        }

        if (typeof value === "string") {
          return [value];
        }

        if (value && typeof value === "object") {
          return Object.values(value)
            .flat()
            .map(String);
        }

        return [];
      })
      .filter(Boolean);

    return messages.length > 0
      ? messages.join(" ")
      : "Registration failed.";
  };

  const handleRegister = async () => {
    if (loading) {
      return;
    }

    setError("");

    const email = form.email.trim().toLowerCase();
    const username = form.username.trim();
    const fullName = form.full_name.trim();
    const phone = form.phone.trim();

    if (
      !email ||
      !username ||
      !fullName ||
      !form.password ||
      !form.password_confirm
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (username.length < 3) {
      setError("Username must contain at least 3 characters.");
      return;
    }

    if (fullName.length < 2) {
      setError("Full name is too short.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          full_name: fullName,
          phone,
          role: form.role,
          password: form.password,
          password_confirm: form.password_confirm,
        }),
      });

      const contentType = response.headers.get("content-type");

      const data = contentType?.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        setError(getErrorMessage(data));
        return;
      }

      router.replace(`/check-email?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleRegister();
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />

        <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
          Create your account
        </h1>

        <p className="mb-6 text-sm text-zinc-600">
          Join RwandaFitness and start your fitness journey.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            required
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-100"
          />

          <input
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            disabled={loading}
            minLength={3}
            required
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-100"
          />

          <input
            name="full_name"
            type="text"
            autoComplete="name"
            placeholder="Full name"
            value={form.full_name}
            onChange={handleChange}
            disabled={loading}
            minLength={2}
            required
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-100"
          />

          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={handleChange}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-100"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-100"
          >
            <option value="client">Client</option>
            <option value="coach">Coach</option>
          </select>

          <input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            minLength={8}
            required
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-100"
          />

          <p className="-mt-2 text-xs text-zinc-500">
            Password must contain at least 8 characters.
          </p>

          <input
            name="password_confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm password"
            value={form.password_confirm}
            onChange={handleChange}
            disabled={loading}
            minLength={8}
            required
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary transition hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}