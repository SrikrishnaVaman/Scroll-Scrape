import Link from "next/link";
import FlamingoSays from "@/components/FlamingoSays";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: spaces } = await supabase.from("spaces").select("id, city").order("created_at");

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Home</h1>
      {!spaces?.length ? (
        <FlamingoSays>
          <p className="font-semibold">Nothing saved yet!</p>
          <p className="text-muted">Save your first place from Instagram and I&apos;ll help you plan a day there.</p>
          <Link href="/add" className="mt-3 inline-block rounded-full bg-flamingo px-4 py-1.5 text-sm font-bold text-white">
            Save a place
          </Link>
        </FlamingoSays>
      ) : (
        <FlamingoSays>
          <p className="font-semibold">Your cities</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {spaces.map((s) => (
              <Link key={s.id} href={`/city/${s.id}`} className="rounded-full bg-flamingo/10 px-3 py-1 text-sm font-semibold text-flamingo-dark hover:bg-flamingo/20">
                {s.city}
              </Link>
            ))}
          </div>
        </FlamingoSays>
      )}
    </div>
  );
}
