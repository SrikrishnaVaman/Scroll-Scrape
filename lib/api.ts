import "server-only";
import { NextResponse } from "next/server";
import { GeminiBusyError } from "./gemini";
import { createClient } from "./supabase/server";

// Every API route starts here: no signed-in user means a 401.
export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) {
    return { error: NextResponse.json({ error: "Please sign in." }, { status: 401 }) } as const;
  }
  return { supabase, userId } as const;
}

// Turn any failure into a friendly JSON reply the flamingo can say.
export function errorResponse(error: unknown) {
  if (error instanceof GeminiBusyError) {
    return NextResponse.json(
      { error: "I need a short rest. Try again in a minute!", busy: true },
      { status: 503 },
    );
  }
  console.error(error);
  return NextResponse.json({ error: "Something went wrong on my side. Please try again." }, { status: 500 });
}
