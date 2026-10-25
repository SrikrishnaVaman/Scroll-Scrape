import "server-only";
import { geoEquirectangular, geoGraticule10, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import land from "world-atlas/land-110m.json";
import { MAP_WIDTH } from "./geo";

// Natural Earth land shapes (public domain) drawn once on the server as SVG paths.
const projection = geoEquirectangular()
  .scale(MAP_WIDTH / (2 * Math.PI))
  .translate([MAP_WIDTH / 2, MAP_WIDTH / 4]);
const path = geoPath(projection);

const topology = land as unknown as Topology;
export const LAND_PATH = path(feature(topology, topology.objects.land)) ?? "";
// Faint latitude and longitude lines every 10 degrees, for an atlas feel.
export const GRATICULE_PATH = path(geoGraticule10()) ?? "";
