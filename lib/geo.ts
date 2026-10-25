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
