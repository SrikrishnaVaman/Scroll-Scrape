// Checks photo matching: 50 m from a saved place matches, 500 m away doesn't.
// Run: node scripts/check-photos.ts
import { nearestPlace } from "../lib/geo.ts";

const lauPaSat = { id: "lau-pa-sat", lat: 1.2805121, lng: 103.8503809 };
const atlas = { id: "atlas", lat: 1.2993, lng: 103.8586 };
const places = [lauPaSat, atlas];

const near = nearestPlace(places, { lat: 1.2805121 + 0.00045, lng: 103.8503809 }); // ~50 m north
const far = nearestPlace(places, { lat: 1.2805121 + 0.0045, lng: 103.8503809 }); // ~500 m north
const ok = near?.id === "lau-pa-sat" && far === null;
console.log(ok ? "PASS" : "FAIL", "50 m ->", near?.id ?? "none", "| 500 m ->", far?.id ?? "none");
process.exit(ok ? 0 : 1);
