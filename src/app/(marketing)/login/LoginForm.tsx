"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/api/httpClient";

/**
 * Return flow for a claimed account. There is no password anywhere in this
 * product — identity is an email or phone plus a one-time code, which is also
 * why the account can start out anonymous and be claimed later.
 */
export default function LoginForm() {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const send = async () => {
    if (!destination.trim()) {
      setError("An email address or a phone number, please.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const { devCode: dev } = await authApi.login(destination.trim());
      setSent(true);
      setDevCode(dev);
    } catch {
      setError("That does not look like an email or a phone number.");
    } finally {
      setPending(false);
    }
  };

  const verify = async () => {
    setPending(true);
    setError(null);
    try {
      const { onboarded } = await authApi.verify(destination.trim(), code.trim());
      router.push(onboarded ? "/today" : "/onboarding");
    } catch {
      setError("That code is not right. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (sent) verify();
        else send();
      }}
    >
      <div>
        <label
          htmlFor="login-destination"
          className="mb-1 block text-sm font-semibold text-gray-700"
        >
          Email or phone
        </label>
        <input
          id="login-destination"
          type="text"
          inputMode="email"
          autoComplete="username"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          disabled={sent}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none disabled:bg-gray-50"
        />
      </div>

      {sent && (
        <div>
          <p role="status" className="mb-3 text-sm text-gray-500">
            If that account exists, a code is on its way.
          </p>
          {devCode && (
            <p className="mb-3 text-xs text-gray-400">
              Development only — your code is {devCode}
            </p>
          )}
          <label
            htmlFor="login-code"
            className="mb-1 block text-sm font-semibold text-gray-700"
          >
            The code we sent
          </label>
          <input
            id="login-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-crisis">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary w-full disabled:opacity-40"
        disabled={pending || (sent && code.trim().length === 0)}
      >
        {sent ? "Log in" : "Send me a code"}
      </button>
    </form>
  );
}
