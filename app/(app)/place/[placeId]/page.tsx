import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronLeft, Clock, ExternalLink, MapPin, Star, Users, Wallet } from "lucide-react";
import EstimateChip from "@/components/EstimateChip";
import PageHeader from "@/components/PageHeader";
import { placeIcon } from "@/components/placeIcon";
import { createClient } from "@/lib/supabase/server";
import type { Place } from "@/lib/types";

const NA = <span className="text-muted">Not available</span>;

export default async function PlacePage({ params }: PageProps<"/place/[placeId]">) {
  const { placeId } = await params;
  const supabase = await createClient();

  const { data } = await supabase.from("places").select("*, spaces(city)").eq("id", placeId).maybeSingle();
  if (!data) notFound();
  const place = data as Place & { spaces: { city: string } };

  // Everything here was stored at save time, so viewing a place makes no Google calls.
  const { Icon, tint } = placeIcon(place.place_type);
  const today = new Date().getDay();
  const week = place.opening_hours?.weekdayDescriptions;
  const todayLine = week?.[(today + 6) % 7];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={place.name}
        tone="pink"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {[place.place_type, place.area].filter(Boolean).join(" · ")}
            {place.visited && (
              <span className="flex items-center gap-1 rounded-full bg-lagoon/15 px-2 py-0.5 text-sm font-semibold text-lagoon">
                <Check size={14} /> Visited
              </span>
            )}
          </span>
        }
      >
        <Link href={`/city/${place.space_id}`} className="mb-3 flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
          <ChevronLeft size={16} /> {place.spaces.city}
        </Link>
        <div className={`mb-3 flex size-14 items-center justify-center rounded-card shadow-sm ${tint}`}>
          <Icon size={26} className="text-ink/70" />
        </div>
      </PageHeader>

      <section className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface shadow-sm">
        <Row icon={<Clock size={18} />} label="Opening hours">
          {week ? (
            <details>
              <summary className="cursor-pointer">Today: {todayLine?.replace(/^[^:]+:\s*/, "")}</summary>
              <ul className="mt-2 text-sm text-muted">
                {week.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </details>
          ) : (
            NA
          )}
        </Row>
        <Row icon={<Users size={18} />} label="Usually busy">
          {place.busy_times ? (
            <>
              {place.busy_times}
              <EstimateChip />
            </>
          ) : (
            NA
          )}
        </Row>
        <Row icon={<Wallet size={18} />} label="Cost per person">
          {place.cost_per_person ?? NA}
        </Row>
        <Row icon={<Star size={18} />} label="Rating">
          {place.rating != null ? `${place.rating} from ${place.rating_count?.toLocaleString()} Google reviews` : NA}
        </Row>
        <Row icon={<MapPin size={18} />} label="Address">
          {place.address ?? NA}
        </Row>
      </section>

      {place.post_url && (
        <a
          href={place.post_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-full bg-flamingo px-5 py-2.5 font-bold text-white hover:bg-flamingo-dark"
        >
          Open the original post <ExternalLink size={16} />
        </a>
      )}

      <section>
        <h2 className="mb-2 font-bold">Your photos</h2>
        <p className="text-sm text-muted">No photos yet. After you visit, add photos from Add and they&apos;ll appear here.</p>
      </section>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4">
      <span className="mt-0.5 text-lagoon">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
        <div>{children}</div>
      </div>
    </div>
  );
}
