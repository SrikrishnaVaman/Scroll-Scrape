"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string };

const USERNAME = /^[a-zA-Z0-9_.]{3,30}$/;

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const username = String(form.get("username") ?? "").trim();

  if (!USERNAME.test(username)) {
    return { error: "Usernames are 3 to 30 letters, numbers, dots or underscores." };
  }
  if (password.length < 6) {
    return { error: "Passwords need at least 6 characters." };
  }

  const supabase = await createClient();

  const { data: available } = await supabase.rpc("username_available", { name: username });
  if (available === false) {
    return { error: `The username "${username}" is taken. Try another one.` };
  }

  // The username travels as sign-up metadata; a database trigger copies it into profiles.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) return { error: error.message };
  if (!data.session) {
    return { error: "Account created, but email confirmation is switched on in Supabase. Turn it off to sign in straight away." };
  }

  redirect("/");
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  });
  if (error) return { error: "That email and password don't match an account." };

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
