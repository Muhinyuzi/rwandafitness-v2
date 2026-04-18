"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type RegisterForm = {
  email: string;
  username: string;
  full_name: string;
  phone: string;
  role: "client" | "coach";
  password: string;
  password_confirm: string;
};

export default function RegisterPage() {
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

  const router = useRouter();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    setError("");

    if (
      !form.email ||
      !form.username ||
      !form.full_name ||
      !form.password ||
      !form.password_confirm
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          typeof data === "object"
            ? JSON.stringify(data)
            : "Registration failed."
        );
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/coaches");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
          Create your account
        </h1>

        <p className="mb-6 text-sm text-zinc-600">
          Join RwandaFitness and start your journey
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <input
            name="full_name"
            type="text"
            placeholder="Full name"
            value={form.full_name}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <input
            name="phone"
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          >
            <option value="client">Client</option>
            <option value="coach">Coach</option>
          </select>

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <input
            name="password_confirm"
            type="password"
            placeholder="Confirm password"
            value={form.password_confirm}
            onChange={handleChange}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-900 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}