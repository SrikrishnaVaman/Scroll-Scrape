// Checks that cities land in the right part of the flat world map.
// Run: node scripts/check-geo.ts
import { toMapPercent } from "../lib/geo.ts";

const checks = [
  { name: "Singapore", lat: 1.35, lng: 103.82, left: [75, 82], top: [52, 64] },
  { name: "London", lat: 51.51, lng: -0.13, left: [48, 52], top: [18, 28] },
  { name: "New York", lat: 40.71, lng: -74.01, left: [27, 32], top: [25, 35] },
];
let ok = true;
for (const c of checks) {
  const at = toMapPercent(c.lat, c.lng);
  const pass = at.left >= c.left[0] && at.left <= c.left[1] && at.top >= c.top[0] && at.top <= c.top[1];
  ok &&= pass;
  console.log(`${pass ? "PASS" : "FAIL"}  ${c.name} at ${at.left.toFixed(1)}% across, ${at.top.toFixed(1)}% down`);
}
process.exit(ok ? 0 : 1);
