import { useState, useRef, useEffect } from "react";
import {
  Search,
  MapPin,
  ArrowLeftRight,
  Loader2,
  Map as MapIcon,
  Navigation,
  Clock,
  Building,
  Home,
  MapPinned,
  Locate,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { searchLocations, getLocationsByZone, getAllZones, createCustomLocation } from "@/lib/pune-locations";
import type { GeocodedPlace } from "@/lib/geocode";
import { searchPuneAddress, reverseGeocode, formatGeocodedPlace } from "@/lib/geocode";
import type { PuneLocation } from "@/types/ride";
import { cn } from "@/lib/utils";

interface LocationSearchProps {
  pickup: PuneLocation | null;
  dropoff: PuneLocation | null;
  onPickupChange: (loc: PuneLocation | null) => void;
  onDropoffChange: (loc: PuneLocation | null) => void;
  onSwap: () => void;
  onSearch: () => void;
  onRequestMapPick: (mode: "pickup" | "dropoff") => void;
  isLoading?: boolean;
}

/** Convert a geocoded place to our PuneLocation format with full address details */
function geocodedToPuneLocation(place: GeocodedPlace, area: string): PuneLocation {
  // Geocoded locations don't map perfectly to our zones, so use a gentle default
  const zone = "core" as const;
  const { title } = formatGeocodedPlace(place);
  return {
    id: place.id,
    name: title,
    area: place.suburb || place.district || area,
    zone,
    coordinates: [place.lat, place.lng],
    landmarks: [place.road, place.neighbourhood, place.suburb].filter(Boolean) as string[],
    pincode: place.postcode,
    isCustom: true,
    fullAddress: place.displayName,
    addressLine1: place.addressLine1,
    addressLine2: place.addressLine2,
    city: place.city,
    district: place.district,
    state: place.state,
    country: place.country,
  };
}

// ==================== LOCATION INFO BADGE ====================
function LocationBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
      <span className="w-3 h-3 flex items-center justify-center">{icon}</span>
      <span>{label}:</span>
      <span className="font-medium text-foreground/80 truncate">{value}</span>
    </div>
  );
}

// ==================== RICH LOCATION RESULT ITEM ====================
function LocationResultItem({
  location,
  onClick,
  isRecent,
}: {
  location: PuneLocation;
  onClick: () => void;
  isRecent?: boolean;
}) {
  const hasRichInfo = location.fullAddress || location.addressLine1 || location.pincode || location.city;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-3 py-3 text-left hover:bg-accent/50 transition-colors group border-b border-border/30 last:border-0"
    >
      {/* Icon */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
        isRecent
          ? "bg-muted"
          : location.isCustom
            ? "bg-indigo-100 dark:bg-indigo-900/30"
            : "bg-primary/5",
      )}>
        {isRecent ? (
          <Clock className="w-4 h-4 text-muted-foreground" />
        ) : location.isCustom ? (
          <MapPin className="w-4 h-4 text-indigo-500" />
        ) : (
          <MapPin className="w-4 h-4 text-primary/60" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
          {location.name}
        </p>

        {/* Address / Subtitle */}
        {(location.addressLine1 || location.area) && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {location.addressLine1 || location.area}
            {location.addressLine1 && location.area && " · "}
            {location.addressLine1 ? "" : location.area}
          </p>
        )}

        {/* Rich Info Badges */}
        {hasRichInfo && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            {location.pincode && (
              <LocationBadge
                icon={<MapPinned className="w-2.5 h-2.5" />}
                label="Pin"
                value={location.pincode}
              />
            )}
            {location.city && (
              <LocationBadge
                icon={<Building className="w-2.5 h-2.5" />}
                label="City"
                value={location.city}
              />
            )}
            {location.district && location.district !== location.city && (
              <LocationBadge
                icon={<Building className="w-2.5 h-2.5" />}
                label="District"
                value={location.district}
              />
            )}
            {location.area && location.area !== location.city && (
              <LocationBadge
                icon={<Home className="w-2.5 h-2.5" />}
                label="Area"
                value={location.area}
              />
            )}
            {location.landmarks && location.landmarks[0] && location.landmarks[0] !== location.name && (
              <LocationBadge
                icon={<Locate className="w-2.5 h-2.5" />}
                label="Near"
                value={location.landmarks[0]}
              />
            )}
          </div>
        )}

        {/* Full address on hover */}
        {location.fullAddress && (
          <p className="text-[10px] text-muted-foreground/50 truncate mt-1 hidden group-hover:block transition-opacity">
            {location.fullAddress}
          </p>
        )}
      </div>                  {/* Zone badge — only show for non-custom locations */}
      {!location.isCustom && (
        <div className="flex-shrink-0 self-start mt-1">
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground uppercase tracking-wider">
            {location.zone}
          </span>
        </div>
      )}
    </button>
  );
}

export function LocationSearch({
  pickup,
  dropoff,
  onPickupChange,
  onDropoffChange,
  onSwap,
  onSearch,
  onRequestMapPick,
  isLoading,
}: LocationSearchProps) {
  const [mode, setMode] = useState<"pickup" | "dropoff" | null>(null);
  const [query, setQuery] = useState("");
  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoResults, setGeoResults] = useState<GeocodedPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search our DB results
  const dbResults = query.trim() ? searchLocations(query) : [];
  const zones = getAllZones();

  // Free-form geocoding search with debounce
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2 || !mode) {
      setTimeout(() => {
        setGeoResults([]);
        setIsSearching(false);
      }, 0);
      return;
    }

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      const results = await searchPuneAddress(query);
      setGeoResults(results);
      setIsSearching(false);
    }, 600);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [query, mode]);

  const handleSelect = (loc: PuneLocation) => {
    if (mode === "pickup") {
      onPickupChange(loc);
      setMode("dropoff");
      setQuery("");
      setGeoResults([]);
      setTimeout(() => dropoffRef.current?.focus(), 100);
    } else if (mode === "dropoff") {
      onDropoffChange(loc);
      setMode(null);
      setQuery("");
      setGeoResults([]);
    }
  };

  const handleSelectGeocoded = (place: GeocodedPlace) => {
    const loc = geocodedToPuneLocation(place, place.suburb || place.district || "");
    handleSelect(loc);
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      const { latitude: lat, longitude: lng } = pos.coords;

      // Try reverse geocoding for a nice address, fall back to custom pin
      const geoPlace = await reverseGeocode(lat, lng);
      if (geoPlace) {
        const loc = geocodedToPuneLocation(geoPlace, geoPlace.suburb || "");
        handleSelect(loc);
      } else {
        const custom = createCustomLocation(lat, lng, "My Location");
        handleSelect(custom);
      }
    } catch (err) {
      console.error("Geolocation error:", err);
    } finally {
      setIsLocating(false);
    }
  };

  const canSearch = pickup && dropoff && pickup.id !== dropoff.id;
  const showResults = mode === "pickup" || mode === "dropoff";
  const hasGeoResults = geoResults.length > 0;
  const hasAnyResults = dbResults.length > 0 || hasGeoResults;

  return (
    <div className="space-y-2">
      {/* Pickup */}
      <div className="relative">
        <div className={cn(
          "flex items-center gap-2 rounded-xl border bg-white dark:bg-neutral-900 px-3 py-2.5 transition-all",
          mode === "pickup" ? "border-primary ring-2 ring-primary/10" : "border-border",
          pickup && mode !== "pickup" && "border-l-emerald-400 border-l-4",
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full flex-shrink-0",
            pickup ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-600",
          )} />
          <input
            ref={pickupRef}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
            placeholder={pickup ? pickup.name : "Where from?"}
            value={mode === "pickup" ? query : pickup?.name || ""}
            onFocus={() => {
              setMode("pickup");
              setQuery("");
              setGeoResults([]);
            }}
            onChange={(e) => setQuery(e.target.value)}
          />
          {pickup && mode !== "pickup" && (
            <button
              onClick={() => {
                onPickupChange(null);
                setMode("pickup");
                setQuery("");
                setGeoResults([]);
                pickupRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          {/* My Location on empty pickup */}
          {mode !== "pickup" && !pickup && (
            <button
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-muted/50 transition-colors text-primary"
              title="Use my current location"
            >
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            </button>
          )}
          {(mode === "pickup" || !pickup) && (
            <button
              onClick={() => onRequestMapPick("pickup")}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              title="Pick on map"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Swap */}
      <div className="flex justify-center -my-1 relative z-10">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-full border-2 bg-background shadow-sm hover:bg-accent"
          onClick={onSwap}
          disabled={!pickup && !dropoff}
        >
          <ArrowLeftRight className="w-3 h-3" />
        </Button>
      </div>

      {/* Dropoff */}
      <div className="relative">
        <div className={cn(
          "flex items-center gap-2 rounded-xl border bg-white dark:bg-neutral-900 px-3 py-2.5 transition-all",
          mode === "dropoff" ? "border-primary ring-2 ring-primary/10" : "border-border",
          dropoff && mode !== "dropoff" && "border-l-red-400 border-l-4",
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full flex-shrink-0",
            dropoff ? "bg-red-500" : "bg-neutral-300 dark:bg-neutral-600",
          )} />
          <input
            ref={dropoffRef}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
            placeholder={dropoff ? dropoff.name : "Where to?"}
            value={mode === "dropoff" ? query : dropoff?.name || ""}
            onFocus={() => {
              setMode("dropoff");
              setQuery("");
              setGeoResults([]);
            }}
            onChange={(e) => setQuery(e.target.value)}
          />
          {dropoff && mode !== "dropoff" && (
            <button
              onClick={() => {
                onDropoffChange(null);
                setMode("dropoff");
                setQuery("");
                setGeoResults([]);
                dropoffRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          {(mode === "dropoff" || !dropoff) && (
            <button
              onClick={() => onRequestMapPick("dropoff")}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              title="Pick on map"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ==================== SEARCH RESULTS ==================== */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-56 overflow-y-auto rounded-lg border bg-white dark:bg-neutral-900 divide-y divide-border/30 shadow-sm">
              {/* --- RECENT / QUICK ACTIONS (when no query) --- */}
              {!query.trim() && (
                <>
                  {/* Quick action buttons */}
                  <div className="px-3 py-2.5 flex gap-2 border-b border-border/30">
                    <button
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 text-xs font-medium text-primary transition-colors"
                    >
                      {isLocating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Navigation className="w-3.5 h-3.5" />
                      )}
                      My Location
                    </button>
                    <button
                      onClick={() => onRequestMapPick(mode!)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 text-xs font-medium transition-colors"
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      Pick on Map
                    </button>
                  </div>

                  {/* Zone listings */}
                  <div className="divide-y divide-border/20">
                    {zones.map((zone) => {
                      const zoneLocs = getLocationsByZone(zone.key);
                      return (
                        <div key={zone.key} className="px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {zone.label}
                            </p>
                            <span className="text-[10px] text-muted-foreground/60">{zoneLocs.length} places</span>
                          </div>
                          <div className="grid grid-cols-2 gap-0.5">
                            {zoneLocs.slice(0, 8).map((loc) => (
                              <button
                                key={loc.id}
                                onClick={() => handleSelect(loc)}
                                className="text-left px-2 py-1.5 rounded text-xs hover:bg-accent/50 transition-colors truncate"
                              >
                                {loc.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* --- SEARCH RESULTS (when typing) --- */}
              {query.trim() && (
                <>
                  {/* Loading indicator */}
                  {isSearching && (
                    <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Searching Pune...
                    </div>
                  )}

                  {/* Geocoded results (free-form address matches) */}
                  {!isSearching && hasGeoResults && (
                    <div>
                      <div className="px-3 py-1.5 bg-muted/20">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Addresses & Places
                        </p>
                      </div>
                      {geoResults.map((place) => {
                        const loc = geocodedToPuneLocation(place, place.suburb || "");
                        return (
                          <LocationResultItem
                            key={loc.id}
                            location={loc}
                            onClick={() => handleSelectGeocoded(place)}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Local DB results */}
                  {dbResults.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 bg-muted/20 border-t border-border/30">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Popular Areas
                        </p>
                      </div>
                      {dbResults.slice(0, 10).map((loc) => (
                        <LocationResultItem
                          key={loc.id}
                          location={loc}
                          onClick={() => handleSelect(loc)}
                        />
                      ))}
                    </div>
                  )}

                  {/* No results */}
                  {!isSearching && !hasAnyResults && (
                    <div className="px-3 py-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                        <Search className="w-5 h-5 text-muted-foreground/60" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No results for "{query}"
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Try a different address, landmark, or area name
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Button */}
      <button
        onClick={onSearch}
        disabled={!canSearch || isLoading}
        className={cn(
          "w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
          canSearch && !isLoading
            ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] shadow-sm"
            : "bg-muted text-muted-foreground cursor-not-allowed",
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Search className="w-4 h-4" />
        )}
        {isLoading
          ? "Scanning fares across Pune..."
          : canSearch
            ? "Search Rides"
            : "Enter pickup & drop-off"}
      </button>
    </div>
  );
}
