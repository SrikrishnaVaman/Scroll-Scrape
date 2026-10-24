import { NextResponse } from "next/server";
import { errorResponse, requireUser } from "@/lib/api";
import { lookupPlace } from "@/lib/maps";

// Look a place up again after the user edits its name or city on the card. No AI involved.
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;

  try {
    const { name, type, city, country } = await request.json();
    const card = await lookupPlace({ name, type: type ?? "", city, country: country ?? "" });
    return NextResponse.json({ card });
  } catch (error) {
    return errorResponse(error);
  }
}
