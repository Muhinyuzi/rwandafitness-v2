"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Invalid email or password.");
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
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />

        <h1 className="mb-2 text-2xl font-semibold text-zinc-900">
          Welcome back
        </h1>

        <p className="mb-6 text-sm text-zinc-600">
          Login to your RwandaFitness account
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-primary"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-primary"
          />

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="rounded-lg bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary transition hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}