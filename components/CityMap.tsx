"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { APIProvider, AdvancedMarker, Map, Pin, useMap } from "@vis.gl/react-google-maps";

type Pinned = { id: string; name: string; lat: number; lng: number };

// The city's Google map with one flamingo-pink pin per saved place. Tapping a pin opens its details.
export default function CityMap({ center, places }: { center: { lat: number; lng: number }; places: Pinned[] }) {
  const router = useRouter();
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY!}>
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={center}
        defaultZoom={12}
        gestureHandling="cooperative"
        disableDefaultUI
        zoomControl
        className="h-80 w-full overflow-hidden rounded-card border border-line shadow-sm sm:h-96"
      >
        {places.map((place) => (
          <AdvancedMarker
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            title={place.name}
            onClick={() => router.push(`/place/${place.id}`)}
          >
            <Pin background="#F2668B" borderColor="#D94C73" glyphColor="#FFFFFF" />
          </AdvancedMarker>
        ))}
        <FitToPins places={places} />
      </Map>
    </APIProvider>
  );
}

// Zoom the map so every pin is in view.
function FitToPins({ places }: { places: Pinned[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || places.length < 2) return;
    const bounds = new google.maps.LatLngBounds();
    places.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, 48);
  }, [map, places]);
  return null;
}
