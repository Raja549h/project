import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents, CircleMarker } from "react-leaflet";
import { MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PuneLocation } from "@/types/ride";
import { PUNE_CENTER } from "@/lib/pune-locations";

// Icons
const pickupIcon = L.divIcon({
  className: "",
  html: `<div style="background:#10b981;color:white;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const dropoffIcon = L.divIcon({
  className: "",
  html: `<div style="background:#ef4444;color:white;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const customPinIcon = L.divIcon({
  className: "",
  html: `<div style="
    background:#6366f1;
    color:white;
    width:32px;height:32px;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    border:3px solid white;
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
    display:flex;align-items:center;justify-content:center;
  ">
    <span style="transform:rotate(45deg);font-size:12px;">📍</span>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 30],
  popupAnchor: [0, -30],
});

function createPriceBadgeIcon(amount: number, label: string, isGreen: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${isGreen ? "#059669" : "#18181b"};
      color:white;
      padding:4px 10px;
      border-radius:8px;
      font-size:12px;
      font-weight:700;
      white-space:nowrap;
      border:2px solid white;
      box-shadow:0 4px 12px rgba(0,0,0,0.25);
      display:flex;align-items:center;gap:4px;
    ">
      <span style="font-size:10px;opacity:0.8;">${label}</span>
      <span>₹${amount}</span>
    </div>`,
    iconSize: [0, 0],
    iconAnchor: [40, 10],
  });
}

const PUNE_BOUNDS = {
  north: 18.95,
  south: 18.15,
  east: 74.65,
  west: 73.35,
};

function MapAutoFitter({ pickup, dropoff, isMapPickMode }: { pickup?: PuneLocation; dropoff?: PuneLocation; isMapPickMode?: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (isMapPickMode) return;
    if (pickup && dropoff) {
      const bounds = L.latLngBounds(
        [pickup.coordinates[0], pickup.coordinates[1]],
        [dropoff.coordinates[0], dropoff.coordinates[1]],
      );
      map.fitBounds(bounds, { padding: [60, 60], animate: true, maxZoom: 15 });
    } else if (pickup) {
      map.setView(pickup.coordinates, 14, { animate: true });
    } else if (dropoff) {
      map.setView(dropoff.coordinates, 14, { animate: true });
    } else {
      map.setView(PUNE_CENTER, 11, { animate: true });
    }
  }, [pickup, dropoff, isMapPickMode, map]);

  return null;
}

interface PricePinData {
  id: string;
  coordinates: [number, number];
  fare: number;
  label: string;
  isGreen?: boolean;
  isLowestPrice?: boolean;
}

export interface PuneMapProps {
  pickup?: PuneLocation | null;
  dropoff?: PuneLocation | null;
  pricePins?: PricePinData[];
  routePoints?: [number, number][];
  mapPickMode?: "pickup" | "dropoff" | null;
  onMapClick?: (lat: number, lng: number) => void;
}

function MapClickHandler({ mapPickMode, onMapClick }: { mapPickMode?: "pickup" | "dropoff" | null; onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (mapPickMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function PuneMap({
  pickup,
  dropoff,
  pricePins = [],
  routePoints = [],
  mapPickMode = null,
  onMapClick,
}: PuneMapProps) {
  const isInPickMode = mapPickMode !== null;

  return (
    <div className="w-full h-full rounded-none relative">
      <MapContainer
        center={PUNE_CENTER}
        zoom={11}
        className="w-full h-full z-0"
        zoomControl={false}
        maxBounds={[
          [PUNE_BOUNDS.south, PUNE_BOUNDS.west],
          [PUNE_BOUNDS.north, PUNE_BOUNDS.east],
        ]}
        maxBoundsViscosity={1}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.r.png"
        />

        {/* Pune coverage indicator */}
        <CircleMarker
          center={PUNE_CENTER}
          radius={80}
          pathOptions={{
            color: "#6366f1",
            fillColor: "#6366f1",
            fillOpacity: 0.03,
            weight: 1,
            dashArray: "4 4",
          }}
        />

        <MapAutoFitter pickup={pickup || undefined} dropoff={dropoff || undefined} isMapPickMode={isInPickMode} />
        <MapClickHandler mapPickMode={mapPickMode} onMapClick={onMapClick} />

        {/* Route Polyline */}
        {routePoints.length > 1 && (
          <>
            <Polyline
              positions={routePoints}
              pathOptions={{ color: "#6366f1", weight: 3, opacity: 0.7 }}
            />
            <Polyline
              positions={routePoints}
              pathOptions={{ color: "#6366f1", weight: 8, opacity: 0.15 }}
            />
          </>
        )}

        {/* Pickup Marker */}
        {pickup && (
          <Marker position={pickup.coordinates} icon={pickup.isCustom ? customPinIcon : pickupIcon}>
            <Popup>
              <div className="text-sm font-medium">{pickup.name}</div>
              <div className="text-xs text-neutral-500">Pickup {pickup.isCustom ? "· Pinned on map" : ""}</div>
            </Popup>
          </Marker>
        )}

        {/* Dropoff Marker */}
        {dropoff && (
          <Marker position={dropoff.coordinates} icon={dropoff.isCustom ? customPinIcon : dropoffIcon}>
            <Popup>
              <div className="text-sm font-medium">{dropoff.name}</div>
              <div className="text-xs text-neutral-500">Drop-off {dropoff.isCustom ? "· Pinned on map" : ""}</div>
            </Popup>
          </Marker>
        )}

        {/* Price Pins */}
        {pricePins.map((pin) => (
          <Marker
            key={pin.id}
            position={pin.coordinates}
            icon={createPriceBadgeIcon(pin.fare, pin.label, pin.isGreen || false)}
          >
            <Popup>
              <div className="text-sm">
                <span className="font-bold">₹{pin.fare}</span>
                <span className="text-neutral-500 ml-1">{pin.label}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay info */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none flex gap-2">
        <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm border border-border/50">
          Pune · PCMC · PMRDA
        </div>
      </div>

      {/* Map Pick Mode Banner */}
      {isInPickMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]">
          <div className="bg-primary/90 backdrop-blur text-primary-foreground px-4 py-2 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Tap on the map to select {mapPickMode === "pickup" ? "pickup" : "drop-off"} location
          </div>
        </div>
      )}
    </div>
  );
}

export type { PricePinData };
