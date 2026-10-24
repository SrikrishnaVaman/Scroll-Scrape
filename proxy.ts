import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16's name for middleware: runs on the server before each page loads.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip API routes (they check sign-in themselves), Next.js internals and image files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
