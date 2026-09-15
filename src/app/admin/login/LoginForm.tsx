"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      <button className="btn w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
