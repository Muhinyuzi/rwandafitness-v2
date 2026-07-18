"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (password !== passwordConfirm) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password/${token}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            password_confirm: passwordConfirm,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Unable to reset password.");
        return;
      }

      setMessage(data.detail);
      setPassword("");
      setPasswordConfirm("");
    } catch {
      setMessage("Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-4 h-1.5 w-14 rounded-full bg-primary" />

        <h1 className="text-3xl font-bold text-zinc-900">
          Reset Password
        </h1>

        {message && (
          <div className="mt-6 rounded-xl bg-zinc-100 p-3 text-sm">
            {message}
          </div>
        )}

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-6 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-primary"
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="mt-4 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-primary"
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-70"
        >
          {loading ? "Saving..." : "Save Password"}
        </button>
      </div>
    </div>
  );
}