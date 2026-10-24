// Checks sign-up, sign-in and row-level security against the real Supabase project.
// Run: node --env-file=.env.local scripts/check-auth.mjs
// Creates two throwaway users, checks each can only see their own profile, then deletes them.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SECRET_KEY;
const admin = createClient(url, secret, { auth: { persistSession: false } });
const stamp = Date.now();
const created = [];
let failed = false;

function check(label, ok) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) failed = true;
}

async function signUp(name) {
  const client = createClient(url, publishable, { auth: { persistSession: false } });
  const email = `check-${name}-${stamp}@scrollscrape.test`;
  const { data, error } = await client.auth.signUp({
    email,
    password: "check-password-123",
    options: { data: { username: `check_${name}_${stamp}` } },
  });
  if (data?.user) created.push(data.user.id);
  check(`sign-up ${name} returns a session`, !error && Boolean(data?.session));
  return { client, email, id: data?.user?.id };
}

try {
  const a = await signUp("a");
  const b = await signUp("b");

  const fresh = createClient(url, publishable, { auth: { persistSession: false } });
  const signIn = await fresh.auth.signInWithPassword({ email: a.email, password: "check-password-123" });
  check("sign-in with email and password works", !signIn.error);

  const own = await a.client.from("profiles").select("username").eq("id", a.id).maybeSingle();
  check("profiles row was created with the username", own.data?.username === `check_a_${stamp}`);

  const other = await b.client.from("profiles").select("username").eq("id", a.id);
  check("user B cannot read user A's profile", other.data?.length === 0);

  const anon = createClient(url, publishable, { auth: { persistSession: false } });
  const anonRows = await anon.from("profiles").select("id");
  check("signed-out visitor sees no profiles", (anonRows.data ?? []).length === 0);

  const taken = await anon.rpc("username_available", { name: `check_a_${stamp}` });
  check("username_available says a used name is taken", taken.data === false);
} finally {
  for (const id of created) await admin.auth.admin.deleteUser(id);
  console.log(`cleaned up ${created.length} test users`);
}
process.exit(failed ? 1 : 0);
