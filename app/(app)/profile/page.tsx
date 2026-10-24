import { signOut } from "@/app/(auth)/actions";
import Flamingo from "@/components/Flamingo";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const [{ data: profile }, places, cities, visited] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user!.id).single(),
    supabase.from("places").select("id", { count: "exact", head: true }),
    supabase.from("spaces").select("id", { count: "exact", head: true }),
    supabase.from("places").select("id", { count: "exact", head: true }).eq("visited", true),
  ]);

  const stats = [
    { label: "Places saved", value: places.count ?? 0 },
    { label: "Cities", value: cities.count ?? 0 },
    { label: "Visited", value: visited.count ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <section className="flex items-center gap-4 rounded-card border border-line bg-surface p-5 shadow-sm">
        <Flamingo className="w-14" />
        <div>
          <p className="text-xl font-bold">@{profile?.username ?? "…"}</p>
          <p className="text-muted">{user!.email}</p>
        </div>
      </section>
      <section className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card border border-line bg-surface p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-flamingo">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </section>
      <form action={signOut}>
        <button className="rounded-full border border-line bg-surface px-5 py-2 font-semibold text-ink hover:border-flamingo">
          Sign out
        </button>
      </form>
    </div>
  );
}
