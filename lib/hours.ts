import type { OpeningHours } from "./types";

// Is the place open on `day` (0 = Sunday) at "HH:MM"? null when Google gave no hours.
export function isOpenAt(hours: OpeningHours | null, day: number, time: string): boolean | null {
  const periods = hours?.periods;
  if (!periods?.length) return null;
  const [h, m] = time.split(":").map(Number);
  const week = 7 * 24 * 60;
  const at = day * 24 * 60 + h * 60 + m;

  return periods.some(({ open, close }) => {
    if (!close) return true; // open 24 hours
    const start = open.day * 24 * 60 + open.hour * 60 + open.minute;
    let end = close.day * 24 * 60 + close.hour * 60 + close.minute;
    if (end <= start) end += week; // closes after midnight or wraps past Saturday
    return (at >= start && at < end) || (at + week >= start && at + week < end);
  });
}

// Google lists weekdayDescriptions Monday first; our days count from Sunday.
export function hoursForDay(hours: OpeningHours | null, day: number): string | null {
  const line = hours?.weekdayDescriptions?.[(day + 6) % 7];
  return line ? line.replace(/^[^:]+:\s*/, "") : null;
}
