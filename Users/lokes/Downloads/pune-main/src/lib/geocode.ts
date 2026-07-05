/**
 * Free-form geocoding service using OpenStreetMap's Nominatim API.
 * No API key required. Rate-limited to 1 request/second.
 */

export interface GeocodedPlace {
  id: string;
  displayName: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  lat: number;
  lng: number;
  type: string;
  category: string;
  // Structured address components
  houseNumber?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  district?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  category: string;
  address: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    district?: string;
    state?: string;
    postcode?: string;
    country?: string;
    amenity?: string;
    building?: string;
    shop?: string;
    tourism?: string;
    leisure?: string;
  };
}

const PUNE_BOUNDS_BBOX = "73.35,18.15,74.65,18.95";

// Simple rate limiter — max 1 request per second
let lastRequestTime = 0;
async function rateLimitedFetch(url: string, init?: RequestInit): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1100) {
    await new Promise((r) => setTimeout(r, 1100 - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, init);
}

/**
 * Search for any address, place, or landmark in Pune using Nominatim.
 * Returns rich location data including address components, coordinates, and type.
 */
export async function searchPuneAddress(query: string): Promise<GeocodedPlace[]> {
  if (!query.trim() || query.trim().length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query + ", Pune, Maharashtra, India",
    )}&format=jsonv2&addressdetails=1&limit=8&bounded=1&viewport=${PUNE_BOUNDS_BBOX}&accept-language=en`;

    const response = await rateLimitedFetch(url, {
      headers: {
        "User-Agent": "PuneRidePulse/1.0 (ride comparison app)",
        "Accept": "application/json",
      },
    });

    if (!response.ok) return [];

    const data: NominatimResult[] = await response.json();

    return data.map((place, index) => {
      const addr = place.address;
      const city = addr.city || addr.town || addr.village || addr.municipality || "";
      const area = addr.suburb || addr.neighbourhood || addr.district || "";

      // Build address lines like Uber does
      const nameParts = [addr.amenity, addr.building, addr.shop, addr.tourism, addr.leisure, addr.road].filter(Boolean);
      const name = nameParts[0] || place.display_name.split(",")[0].trim();
      const line1 = [addr.house_number, addr.road].filter(Boolean).join(", ");
      const line2 = [area, city, addr.postcode].filter(Boolean).join(", ");

      return {
        id: `geo-${place.place_id}-${index}`,
        displayName: place.display_name,
        name: name || place.display_name.split(",")[0].trim(),
        addressLine1: line1 || addr.road || area || "",
        addressLine2: line2 || city || "",
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        type: place.type,
        category: place.category,
        houseNumber: addr.house_number,
        road: addr.road,
        neighbourhood: addr.neighbourhood,
        suburb: addr.suburb,
        city,
        district: addr.district,
        state: addr.state,
        postcode: addr.postcode,
        country: addr.country,
      };
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
}

/**
 * Reverse geocode a lat/lng to get address info.
 * Used when user pins a location on the map.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedPlace | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&accept-language=en`;

    const response = await rateLimitedFetch(url, {
      headers: {
        "User-Agent": "PuneRidePulse/1.0 (ride comparison app)",
        "Accept": "application/json",
      },
    });

    if (!response.ok) return null;

    const data: NominatimResult & { display_name: string } = await response.json();
    const addr = data.address;
    const city = addr.city || addr.town || addr.village || addr.municipality || "";
    const area = addr.suburb || addr.neighbourhood || addr.district || "";

    return {
      id: `geo-rev-${data.place_id || `${lat.toFixed(5)}${lng.toFixed(5)}`}`,
      displayName: data.display_name,
      name: [addr.road, addr.amenity, area].filter(Boolean)[0] || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      addressLine1: [addr.house_number, addr.road].filter(Boolean).join(", ") || area,
      addressLine2: [area, city, addr.postcode].filter(Boolean).join(", "),
      lat,
      lng,
      type: data.type || "yes",
      category: data.category || "place",
      road: addr.road,
      neighbourhood: addr.neighbourhood,
      suburb: addr.suburb,
      city,
      district: addr.district,
      state: addr.state,
      postcode: addr.postcode,
      country: addr.country,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/** Format a geocoded place into a concise address string like Uber does */
export function formatGeocodedPlace(place: GeocodedPlace): { title: string; subtitle: string } {
  const title = place.name || place.addressLine1.split(",")[0] || "Unknown location";
  const subtitle = [place.addressLine1, place.addressLine2].filter(Boolean).join(", ");
  return { title, subtitle };
}
