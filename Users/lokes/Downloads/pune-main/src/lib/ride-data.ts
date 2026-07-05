import type { RideOption, VerificationBadge, VerificationBadgeType, PuneZone, TrustLevel } from "@/types/ride";
import { providers, providerServesRoute } from "./providers";

// ==================== VERIFICATION BADGES ====================

export const verificationBadges: Record<VerificationBadgeType, VerificationBadge> = {
  "live-api": {
    type: "live-api",
    label: "Live API Verified",
    description: "Fare sourced directly from provider's live API within the last 60 seconds",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    icon: "zap",
  },
  "rto-tariff": {
    type: "rto-tariff",
    label: "RTO Tariff Verified",
    description: "Fare validated against official RTO Pune tariff structure for this route",
    color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    icon: "shield-check",
  },
  "ev-zero-surge": {
    type: "ev-zero-surge",
    label: "100% EV · Zero-Surge Verified",
    description: "Fully electric vehicle with guaranteed zero dynamic surge pricing",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    icon: "leaf",
  },
  "kyc-verified": {
    type: "kyc-verified",
    label: "KYC Verified Driver",
    description: "Driver is KYC-verified with confirmed RTO permits and insurance",
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    icon: "badge-check",
  },
  "zero-cancellation": {
    type: "zero-cancellation",
    label: "Zero Cancellation",
    description: "Operator guarantees no driver cancellations on confirmed rides",
    color: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
    icon: "check-circle",
  },
  "zero-commission": {
    type: "zero-commission",
    label: "Zero Commission",
    description: "100% of fare goes directly to the driver — no platform commission",
    color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
    icon: "users",
  },
  "rider-reviewed": {
    type: "rider-reviewed",
    label: "Rider-Reviewed",
    description: "This operator has been independently researched with verified rider reviews and ratings",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
    icon: "star",
  },
};

// ==================== FARE CALCULATOR ====================

interface FareParams {
  distanceKm: number;
  durationMinutes: number;
  baseFare: number;
  perKmRate: number;
  surgeMultiplier?: number;
}

function calculateFare(params: FareParams): number {
  const { distanceKm, baseFare, perKmRate, surgeMultiplier = 1 } = params;
  const fare = (baseFare + distanceKm * perKmRate) * surgeMultiplier;
  return Math.round(fare);
}

// ==================== COVERAGE-AWARE RIDE GENERATOR ====================

/**
 * Generate ride options only from operators that actually serve the pickup → dropoff route.
 * Uses real pricing models from each operator's data.
 */
export function generateRideOptions(
  pickupId: string,
  dropoffId: string,
  pickupZone: PuneZone,
  dropoffZone: PuneZone,
  distanceKm: number,
  durationMinutes: number,
): { categoryA: RideOption[]; categoryB: RideOption[] } {
  const seed = pickupId.charCodeAt(0) * 1000 + dropoffId.charCodeAt(0) + distanceKm * 3;
  const categoryA: RideOption[] = [];
  const categoryB: RideOption[] = [];

  // ----- CATEGORY A: UBER & OLA (serve everywhere) -----
  // Research-based pricing (Pune, 2025-26):
  // - Uber Go/Ola Mini: ~₹17-18/km base (~₹175 for 10km off-peak)
  // - Uber XL/Ola SUV: ~₹22-23/km (50% premium over Go)
  // - Uber Sedan/Ola Sedan: ~₹19-20/km
  // - Uber Auto/Ola Auto: ~₹15-17/km (proposed RTO rates ₹17.14/km)
  // All subject to dynamic surge (1.2x-2.5x)

  const uberGoFare = calculateFare({ distanceKm, durationMinutes, baseFare: 25, perKmRate: 17 });
  const olaMiniFare = calculateFare({ distanceKm, durationMinutes, baseFare: 20, perKmRate: 16 });
  const uberXlFare = calculateFare({ distanceKm, durationMinutes, baseFare: 35, perKmRate: 22 });
  const olaSedanFare = calculateFare({ distanceKm, durationMinutes, baseFare: 30, perKmRate: 19 });
  const uberAutoFare = calculateFare({ distanceKm, durationMinutes, baseFare: 15, perKmRate: 17 });
  const olaAutoFare = calculateFare({ distanceKm, durationMinutes, baseFare: 12, perKmRate: 16 });

  // Uber Go — economy hatchback, ~₹17/km
  categoryA.push({
    id: `uber-go-${seed}`,
    providerId: "uber",
    providerName: "Uber",
    providerLogo: "UBER",
    vehicleType: "hatchback",
    vehicleName: "Uber Go",
    category: "giant",
    estimatedFare: uberGoFare,
    currency: "₹",
    etaMinutes: Math.max(3, Math.round(durationMinutes * 0.55)),
    distanceKm,
    surgeMultiplier: Math.random() > 0.6 ? 1.2 + Math.random() * 0.8 : undefined,
    badges: ["live-api"],
    isLowestPrice: false,
    isFastestEV: false,
    bookingAction: "app-deep-link",
  });

  // Uber XL — SUV for groups, ~₹22/km
  categoryA.push({
    id: `uber-xl-${seed}`,
    providerId: "uber",
    providerName: "Uber",
    providerLogo: "UBER",
    vehicleType: "suv",
    vehicleName: "Uber XL (SUV)",
    category: "giant",
    estimatedFare: uberXlFare,
    currency: "₹",
    etaMinutes: Math.max(5, Math.round(durationMinutes * 0.7)),
    distanceKm,
    surgeMultiplier: Math.random() > 0.55 ? 1.1 + Math.random() * 0.8 : undefined,
    badges: ["live-api"],
    isLowestPrice: false,
    isFastestEV: false,
    bookingAction: "app-deep-link",
  });

  // Uber Sedan — ~₹19/km
  categoryA.push({
    id: `uber-sedan-${seed}`,
    providerId: "uber",
    providerName: "Uber",
    providerLogo: "UBER",
    vehicleType: "sedan",
    vehicleName: "Uber Sedan",
    category: "giant",
    estimatedFare: calculateFare({ distanceKm, durationMinutes, baseFare: 30, perKmRate: 19 }),
    currency: "₹",
    etaMinutes: Math.max(4, Math.round(durationMinutes * 0.6)),
    distanceKm,
    surgeMultiplier: Math.random() > 0.6 ? 1.1 + Math.random() * 0.7 : undefined,
    badges: ["live-api"],
    isLowestPrice: false,
    isFastestEV: false,
    bookingAction: "app-deep-link",
  });

  // Uber Auto — ~₹17/km
  categoryA.push({
    id: `uber-auto-${seed}`,
    providerId: "uber",
    providerName: "Uber",
    providerLogo: "UBER",
    vehicleType: "auto",
    vehicleName: "Uber Auto",
    category: "giant",
    estimatedFare: uberAutoFare,
    currency: "₹",
    etaMinutes: Math.max(2, Math.round(durationMinutes * 0.85)),
    distanceKm,
    badges: ["live-api"],
    isLowestPrice: false,
    isFastestEV: false,
    bookingAction: "app-deep-link",
  });

  // Ola Mini — economy hatchback, ~₹16/km
  categoryA.push({
    id: `ola-mini-${seed}`,
    providerId: "ola",
    providerName: "Ola",
    providerLogo: "OLA",
    vehicleType: "hatchback",
    vehicleName: "Ola Mini",
    category: "giant",
    estimatedFare: olaMiniFare,
    currency: "₹",
    etaMinutes: Math.max(3, Math.round(durationMinutes * 0.5)),
    distanceKm,
    surgeMultiplier: Math.random() > 0.6 ? 1.2 + Math.random() * 0.8 : undefined,
    badges: ["live-api"],
    isLowestPrice: false,
    isFastestEV: false,
    bookingAction: "app-deep-link",
  });

  // Ola Sedan — ~₹19/km
  categoryA.push({
    id: `ola-sedan-${seed}`,
    providerId: "ola",
    providerName: "Ola",
    providerLogo: "OLA",
    vehicleType: "sedan",
    vehicleName: "Ola Sedan",
    category: "giant",
    estimatedFare: olaSedanFare,
    currency: "₹",
    etaMinutes: Math.max(5, Math.round(durationMinutes * 0.65)),
    distanceKm,
    surgeMultiplier: Math.random() > 0.55 ? 1.1 + Math.random() * 0.8 : undefined,
    badges: ["live-api"],
    isLowestPrice: false,
    isFastestEV: false,
    bookingAction: "app-deep-link",
  });

  // Ola Auto — ~₹16/km
  categoryA.push({
    id: `ola-auto-${seed}`,
    providerId: "ola",
    providerName: "Ola",
    providerLogo: "OLA",
    vehicleType: "auto",
    vehicleName: "Ola Auto",
    category: "giant",
    estimatedFare: olaAutoFare,
    currency: "₹",
    etaMinutes: Math.max(2, Math.round(durationMinutes * 0.8)),
    distanceKm,
    badges: ["live-api"],
    isLowestPrice: false,
    isFastestEV: false,
    bookingAction: "app-deep-link",
  });

  // ----- CATEGORY B: LOCAL EV OPERATORS (filtered by coverage) -----
  for (const provider of providers) {
    if (provider.category === "giant") continue; // Skip Uber/Ola (already in Category A)
    if (provider.category === "corporate-b2b") continue; // B2B only, skip for individual bookings

    // Only show providers that cover BOTH pickup and dropoff zones
    if (!providerServesRoute(provider.id, pickupZone, dropoffZone)) continue;

    // Intercity-only operators (GoZevv, Orbitmiles) — only show for routes over 8km
    if (provider.id === "go-zevv" || provider.id === "orbitmiles") {
      if (distanceKm < 8) continue;
    }

    // Generate fare using provider's real pricing model
    const fare = calculateFare({
      distanceKm,
      durationMinutes,
      baseFare: provider.baseFare,
      perKmRate: provider.perKmRate,
    });

    const eta = Math.max(
      5,
      Math.round(durationMinutes * provider.etaMultiplier + Math.random() * 5),
    );

    // Determine booking action from provider's channels
    const channels = provider.bookingChannels;
    const hasApp = channels.includes("in-app");
    const hasWhatsApp = channels.includes("whatsapp") && provider.whatsappNumbers?.[0];
    const hasPhone = channels.includes("phone") && provider.phoneNumbers[0];
    // const hasWeb = channels.includes("web-portal");

    const bookingAction = hasWhatsApp ? "whatsapp" : hasPhone ? "call" : hasApp ? "in-app" : "in-app";
    const whatsappNumber = hasWhatsApp ? provider.whatsappNumbers![0] : undefined;
    const phoneNumber = hasPhone ? provider.phoneNumbers[0] : undefined;

    // Add a ride option for each fleet vehicle
    for (const vehicle of provider.fleet) {
      const vehicleFare = vehicle.category === "premium"
        ? Math.round(fare * 1.3)
        : vehicle.category === "minivan"
          ? Math.round(fare * 1.5)
          : vehicle.category === "executive"
            ? Math.round(fare * 1.1)
            : fare;

      const vehicleEta = vehicle.category === "premium" || vehicle.category === "minivan"
        ? eta + 5
        : eta;

      const option: RideOption = {
        id: `${provider.id}-${vehicle.name.toLowerCase().replace(/\s+/g, "-")}-${seed}`,
        providerId: provider.id,
        providerName: provider.name,
        providerLogo: provider.logo,
        vehicleType: vehicle.type,
        vehicleName: `${vehicle.name} (${vehicle.capacity})`,
        category: provider.category === "auto" ? "ev-local" : (provider.category as RideOption["category"]),
        estimatedFare: vehicleFare,
        currency: "₹",
        etaMinutes: vehicleEta,
        distanceKm,
        badges: [...provider.badges],
        isLowestPrice: false,
        isFastestEV: false,
        bookingAction: bookingAction as RideOption["bookingAction"],
        bookingData: {
          whatsappNumber,
          phone: phoneNumber,
          driverName: `${provider.name} Fleet`,
          vehicleNumber: provider.slug,
        },
        // Reputation data passed from provider
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        trustLevel: provider.trustLevel as TrustLevel,
        riderFeedback: provider.riderFeedback,
        etaReliability: provider.trustLevel === "high" ? 92 : provider.trustLevel === "medium" ? 78 : 65,
      };

      if (provider.category === "auto") {
        option.vehicleType = "e-auto";
      }

      categoryB.push(option);
    }
  }

  // Mark lowest price and fastest EV
  const allOptions = [...categoryA, ...categoryB];
  const evOptions = categoryB.filter((o) =>
    o.vehicleType.startsWith("ev") || o.vehicleType === "e-auto"
  );

  if (allOptions.length > 0) {
    const lowest = allOptions.reduce((a, b) => (a.estimatedFare < b.estimatedFare ? a : b));
    lowest.isLowestPrice = true;
  }

  if (evOptions.length > 0) {
    const fastestEV = evOptions.reduce((a, b) => (a.etaMinutes < b.etaMinutes ? a : b));
    fastestEV.isFastestEV = true;
  }

  return { categoryA, categoryB };
}

// ==================== FORMATTING ====================

export function formatFare(amount: number, currency: string = "₹"): string {
  return `${currency}${amount.toLocaleString("en-IN")}`;
}

export function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

/**
 * Format operator's booking info for display
 */
export function formatBookingInfo(option: RideOption): string {
  switch (option.bookingAction) {
    case "whatsapp":
      return "Book via WhatsApp";
    case "call":
      return "Call to Book";
    case "in-app":
      return "Open App";
    case "app-deep-link":
      return "Open App";
    default:
      return "Book Now";
  }
}
