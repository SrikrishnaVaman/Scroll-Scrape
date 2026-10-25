"use client";

import Link from "next/link";
import { useActionState } from "react";
import Flamingo from "@/components/Flamingo";
import { signIn, signUp, type AuthState } from "./actions";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    mode === "signup" ? signUp : signIn,
    {},
  );
  const isSignup = mode === "signup";

  return (
    <main className="flex w-full flex-1 flex-col justify-center bg-gradient-to-br from-[#FFD6E1] via-cream to-[#C6E9F7] px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <Flamingo className="w-20" />
        <h1 className="mt-2 font-serif text-5xl italic">Scroll Scrape</h1>
        <p className="text-muted">Saved places become plans.</p>
      </div>

      <form action={action} className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-bold">{isSignup ? "Create your account" : "Welcome back"}</h2>
        <Field label="Email" name="email" type="email" autoComplete="email" />
        {isSignup && <Field label="Username" name="username" type="text" autoComplete="username" />}
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
        {state.error && <p className="rounded-lg bg-flamingo/10 px-3 py-2 text-sm text-flamingo-dark">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-flamingo py-2.5 font-bold text-white transition hover:bg-flamingo-dark disabled:opacity-60"
        >
          {pending ? "One moment…" : isSignup ? "Sign up" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-lagoon">
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
      </div>
    </main>
  );
}

function Field(props: { label: string; name: string; type: string; autoComplete: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {props.label}
      <input
        name={props.name}
        type={props.type}
        autoComplete={props.autoComplete}
        required
        className="rounded-xl border border-line bg-cream px-3 py-2 font-normal outline-none focus:border-flamingo"
      />
    </label>
  );
}
