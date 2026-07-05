import { useState, useCallback, useMemo } from "react";
import type {
  PuneLocation,
  RideOption,
  ComparisonResult,
  RouteInfo,
  FilterState,
  PuneZone,
} from "@/types/ride";
import { generateRideOptions } from "@/lib/ride-data";
import { executeBookingAction } from "@/lib/deep-links";

// Simulated route calculation
function calculateRoute(pickup: PuneLocation, dropoff: PuneLocation): RouteInfo {
  const R = 6371;
  const lat1 = (pickup.coordinates[0] * Math.PI) / 180;
  const lat2 = (dropoff.coordinates[0] * Math.PI) / 180;
  const dLat = ((dropoff.coordinates[0] - pickup.coordinates[0]) * Math.PI) / 180;
  const dLon = ((dropoff.coordinates[1] - pickup.coordinates[1]) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c * 10) / 10;
  const avgSpeedKmph = 25 + Math.random() * 10;
  const durationMinutes = Math.round((distanceKm / avgSpeedKmph) * 60);

  const points: [number, number][] = [];
  const steps = Math.max(5, Math.ceil(distanceKm * 2));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = pickup.coordinates[0] + (dropoff.coordinates[0] - pickup.coordinates[0]) * t;
    const lng = pickup.coordinates[1] + (dropoff.coordinates[1] - pickup.coordinates[1]) * t;
    const curve = Math.sin(t * Math.PI) * 0.01;
    points.push([lat + curve * 0.5, lng - curve]);
  }

  return { pickup, dropoff, distanceKm, durationMinutes, polylinePoints: points };
}

export function useRideComparison() {
  const [pickup, setPickup] = useState<PuneLocation | null>(null);
  const [dropoff, setDropoff] = useState<PuneLocation | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<RideOption | null>(null);
  const [mapPickMode, setMapPickMode] = useState<"pickup" | "dropoff" | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    activeCategory: "all",
    sortBy: "price",
    showSurgeOnly: false,
    selectedVehicleTypes: [],
  });

  const handleSearch = useCallback(async () => {
    if (!pickup || !dropoff) return;
    if (pickup.id === dropoff.id) return;

    setIsLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 1200));

      const route = calculateRoute(pickup, dropoff);
      const pickupZone: PuneZone = pickup.zone;
      const dropoffZone: PuneZone = dropoff.zone;

      const { categoryA, categoryB } = generateRideOptions(
        pickup.id,
        dropoff.id,
        pickupZone,
        dropoffZone,
        route.distanceKm,
        route.durationMinutes,
      );

      const allOptions = [...categoryA, ...categoryB];
      const evOptions = categoryB.filter((o) =>
        o.vehicleType.startsWith("ev") || o.vehicleType === "e-auto"
      );

      const lowest = allOptions.length > 0
        ? allOptions.reduce((a, b) => (a.estimatedFare < b.estimatedFare ? a : b))
        : undefined;
      const fastestEV = evOptions.length > 0
        ? evOptions.reduce((a, b) => (a.etaMinutes < b.etaMinutes ? a : b))
        : undefined;

      setResult({
        pickup,
        dropoff,
        route,
        categoryA,
        categoryB,
        lowestPrice: lowest
          ? { option: lowest, amount: lowest.estimatedFare }
          : { option: categoryA[0], amount: categoryA[0]?.estimatedFare || 0 },
        fastestEV: fastestEV
          ? { option: fastestEV, amount: fastestEV.estimatedFare, eta: fastestEV.etaMinutes }
          : { option: categoryA[0], amount: 0, eta: 0 },
      });
    } catch (error) {
      console.error("Ride search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pickup, dropoff]);

  const handleSwap = useCallback(() => {
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
    setResult(null);
  }, [pickup, dropoff]);

  const handleSelectRide = useCallback((option: RideOption) => {
    setSelectedOption(option);
    if (!pickup || !dropoff) return;

    executeBookingAction(
      option.providerId,
      option,
      { name: pickup.name, coordinates: pickup.coordinates },
      { name: dropoff.name, coordinates: dropoff.coordinates },
      option.vehicleName,
      option.estimatedFare,
    );
  }, [pickup, dropoff]);

  const handlePickupChange = useCallback((loc: PuneLocation | null) => {
    setPickup(loc);
    setResult(null);
    setSelectedOption(null);
    setMapPickMode(null);
  }, []);

  const handleDropoffChange = useCallback((loc: PuneLocation | null) => {
    setDropoff(loc);
    setResult(null);
    setSelectedOption(null);
    setMapPickMode(null);
  }, []);

  const filteredCategoryA = useMemo(() => {
    if (!result) return [];
    let options = [...result.categoryA];
    if (filter.activeCategory === "ev-local") return [];
    if (filter.showSurgeOnly) options = options.filter((o) => (o.surgeMultiplier ?? 1) > 1);
    if (filter.selectedVehicleTypes.length > 0)
      options = options.filter((o) => filter.selectedVehicleTypes.includes(o.vehicleType));
    switch (filter.sortBy) {
      case "price":
        options.sort((a, b) => a.estimatedFare - b.estimatedFare);
        break;
      case "eta":
        options.sort((a, b) => a.etaMinutes - b.etaMinutes);
        break;
      case "provider":
        options.sort((a, b) => a.providerName.localeCompare(b.providerName));
        break;
      case "rating":
        options.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }
    return options;
  }, [result, filter]);

  const filteredCategoryB = useMemo(() => {
    if (!result) return [];
    let options = [...result.categoryB];
    if (filter.activeCategory === "giant") return [];
    if (filter.showSurgeOnly) return [];
    if (filter.selectedVehicleTypes.length > 0)
      options = options.filter((o) => filter.selectedVehicleTypes.includes(o.vehicleType));
    switch (filter.sortBy) {
      case "price":
        options.sort((a, b) => a.estimatedFare - b.estimatedFare);
        break;
      case "eta":
        options.sort((a, b) => a.etaMinutes - b.etaMinutes);
        break;
      case "provider":
        options.sort((a, b) => a.providerName.localeCompare(b.providerName));
        break;
      case "rating":
        options.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }
    return options;
  }, [result, filter]);

  return {
    pickup,
    dropoff,
    result,
    isLoading,
    selectedOption,
    filter,
    filteredCategoryA,
    filteredCategoryB,
    setFilter,
    handleSearch,
    handleSwap,
    handleSelectRide,
    handlePickupChange,
    handleDropoffChange,
    mapPickMode,
    setMapPickMode,
    routePoints: result?.route.polylinePoints ?? [],
    pricePins: result
        ? [
            {
              id: "lowest",
              coordinates: [pickup?.coordinates[0] ?? 0, pickup?.coordinates[1] ?? 0] as [number, number],
              fare: result.lowestPrice.amount,
              label: "Lowest Fare",
              isLowestPrice: true,
            },
            {
              id: "fastest-ev",
              coordinates: [dropoff?.coordinates[0] ?? 0, dropoff?.coordinates[1] ?? 0] as [number, number],
              fare: result.fastestEV.amount,
              label: "Fastest EV",
              isGreen: true,
            },
          ]
        : [],
  };
}
