"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function DashboardPage() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`${API_URL}/api/auth/me/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => res.json())
      .then((user) => {
        if (user.role === "coach") {
          window.location.href = "/dashboard/coach";
        } else {
          window.location.href = "/dashboard/client";
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, []);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />

        <h1 className="text-2xl font-bold text-zinc-900">Loading dashboard</h1>

        <p className="mt-3 text-sm text-zinc-600">
          Please wait while we redirect you to your RwandaFitness dashboard.
        </p>
      </div>
    </div>
  );
}