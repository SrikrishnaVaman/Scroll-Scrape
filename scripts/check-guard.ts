// Checks the "only your saves" guard drops places that aren't saved.
// Run: node scripts/check-guard.ts
import { keepSavedStops } from "../lib/guard.ts";

const saved = new Set(["pizza", "cicheti"]);
const out = keepSavedStops(
  [
    { placeId: "cicheti", suggestedTime: "19:00" },
    { placeId: "made-up-place", suggestedTime: "15:00" },
    { placeId: "pizza", suggestedTime: "12:30" },
    { placeId: "pizza", suggestedTime: "13:00" },
  ],
  saved,
);
const ids = out.map((s) => s.placeId).join(",");
console.log(ids === "pizza,cicheti" ? "PASS" : "FAIL", "guard kept:", ids);
process.exit(ids === "pizza,cicheti" ? 0 : 1);
