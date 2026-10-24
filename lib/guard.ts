// The "only your saves" rule, enforced in code: keep only stops whose placeId is one of the
// user's saved places, drop repeats, and put them in time order.
export function keepSavedStops<T extends { placeId: string; suggestedTime: string }>(
  stops: T[] | undefined,
  savedIds: Set<string>,
): T[] {
  const seen = new Set<string>();
  return (stops ?? [])
    .filter((s) => savedIds.has(s.placeId) && !seen.has(s.placeId) && seen.add(s.placeId))
    .sort((a, b) => a.suggestedTime.localeCompare(b.suggestedTime));
}
