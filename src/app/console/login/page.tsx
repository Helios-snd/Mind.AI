"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConsoleLogin } from "@/console-api/hooks";
import { ConsoleHttpError } from "@/console-api/client";

export default function ConsoleLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useConsoleLogin();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      { onSuccess: () => router.replace("/console") },
    );
  };

  const errorMessage =
    login.error instanceof ConsoleHttpError && login.error.status === 401
      ? "Email or password is not right."
      : login.isError
        ? "Something went wrong. Try again."
        : null;

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <h1 className="text-lg font-semibold text-gray-900">Counsellor sign in</h1>
      <p className="mt-1 text-sm text-gray-500">
        For approved counsellors only. Accounts are provisioned directly.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {login.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
