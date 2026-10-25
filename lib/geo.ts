// The flat world map is an equirectangular projection: longitude maps straight to x and
// latitude straight to y. The map is 1000 x 500 units for the whole world, cropped to
// leave out Antarctica and the far Arctic.
export const MAP_WIDTH = 1000;
export const MAP_TOP = 17; // latitude 84°N
export const MAP_HEIGHT = 394; // down to 58°S

export function toMapXY(lat: number, lng: number) {
  return {
    x: ((lng + 180) / 360) * MAP_WIDTH,
    y: ((90 - lat) / 180) * (MAP_WIDTH / 2),
  };
}

// Position on the cropped map as percentages, for placing HTML dots over the SVG.
export function toMapPercent(lat: number, lng: number) {
  const { x, y } = toMapXY(lat, lng);
  return { left: (x / MAP_WIDTH) * 100, top: ((y - MAP_TOP) / MAP_HEIGHT) * 100 };
}

// Straight-line distance in metres between two points (haversine formula).
export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6_371_000;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const MATCH_RADIUS_METERS = 200;

// The closest saved place within 200 m of where a photo was taken, or null.
export function nearestPlace<T extends { lat: number | null; lng: number | null }>(
  places: T[],
  at: { lat: number; lng: number },
): T | null {
  let best: T | null = null;
  let bestDistance = MATCH_RADIUS_METERS;
  for (const place of places) {
    if (place.lat == null || place.lng == null) continue;
    const d = distanceMeters(at, { lat: place.lat, lng: place.lng });
    if (d <= bestDistance) {
      best = place;
      bestDistance = d;
    }
  }
  return best;
}
