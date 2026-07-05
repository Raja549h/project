export type ProviderCategory = "giant" | "ev-local" | "independent" | "corporate-b2b" | "auto";

export type VehicleType =
  | "hatchback"
  | "sedan"
  | "suv"
  | "auto"
  | "e-auto"
  | "ev-sedan"
  | "ev-suv"
  | "ev-hatchback"
  | "ev-premium-suv"
  | "ev-minivan";

export type VerificationBadgeType =
  | "live-api"
  | "rto-tariff"
  | "ev-zero-surge"
  | "kyc-verified"
  | "zero-cancellation"
  | "zero-commission"
  | "rider-reviewed";

export type TrustLevel = "high" | "medium" | "emerging" | "limited";

export type BookingChannel = "whatsapp" | "phone" | "app-deep-link" | "web-portal" | "in-app" | "corporate-desk" | "street-hail";

export type PuneZone = "core" | "pcmc" | "suburban-east" | "suburban-west" | "suburban-south" | "commercial";

export interface FleetVehicle {
  name: string;
  type: VehicleType;
  capacity: string;
  description: string;
  category: "executive" | "premium" | "economy" | "auto" | "suv" | "minivan";
}

export interface Provider {
  id: string;
  name: string;
  brand: string;
  slug: string;
  logo: string;
  category: ProviderCategory;
  description: string;
  website?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  // Real contact info
  phoneNumbers: string[];
  whatsappNumbers?: string[];
  // Fleet composition
  fleet: FleetVehicle[];
  // Coverage zones this operator serves
  coverageZones: PuneZone[];
  // Specific areas they serve (from their data)
  coverageAreas: string[];
  // Pricing model description
  pricingModel: string;
  pricingDetails: string[];
  // Booking channels available
  bookingChannels: BookingChannel[];
  // Special badges
  badges: VerificationBadgeType[];
  // Base ETA multiplier (how quickly they can arrive relative to distance)
  etaMultiplier: number;
  // Minimum fare for this operator
  baseFare: number;
  // Per-km rate
  perKmRate: number;
  // ====== REPUTATION & TRUST DATA ======
  /** Aggregate rating out of 5 from real rider reviews */
  rating: number;
  /** Number of reviews this rating is based on */
  reviewCount: number;
  /** Trust level based on reputation research */
  trustLevel: TrustLevel;
  /** Brief summary of rider feedback (from real reviews) */
  riderFeedback: string[];
}

export interface VerificationBadge {
  type: VerificationBadgeType;
  label: string;
  description: string;
  color: string;
  icon: string;
}

export interface RideOption {
  id: string;
  providerId: string;
  providerName: string;
  providerLogo: string;
  vehicleType: VehicleType;
  vehicleName: string;
  category: ProviderCategory;
  estimatedFare: number;
  originalFare?: number;
  currency: string;
  etaMinutes: number;
  distanceKm: number;
  surgeMultiplier?: number;
  badges: VerificationBadgeType[];
  isLowestPrice: boolean;
  isFastestEV: boolean;
  deepLink?: string;
  bookingAction: "app-deep-link" | "whatsapp" | "call" | "in-app";
  bookingData?: {
    phone?: string;
    whatsappNumber?: string;
    driverName?: string;
    vehicleNumber?: string;
    partnerId?: string;
  };
  // ====== REPUTATION ON RIDE OPTION ======
  /** Provider's aggregate rating (0-5) */
  rating?: number;
  /** Number of reviews this rating is based on */
  reviewCount?: number;
  /** Trust level badge */
  trustLevel?: TrustLevel;
  /** Sample rider feedback snippets */
  riderFeedback?: string[];
  /** Reliability score for ETA accuracy (0-100) */
  etaReliability?: number;
}

export interface PuneLocation {
  id: string;
  name: string;
  area: string;
  zone: PuneZone;
  coordinates: [number, number];
  landmarks: string[];
  pincode?: string;
  isCustom?: boolean;
  // Rich address details (from geocoding)
  fullAddress?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
}

export interface RouteInfo {
  pickup: PuneLocation;
  dropoff: PuneLocation;
  distanceKm: number;
  durationMinutes: number;
  polylinePoints: [number, number][];
}

export interface ComparisonResult {
  pickup: PuneLocation;
  dropoff: PuneLocation;
  route: RouteInfo;
  categoryA: RideOption[];
  categoryB: RideOption[];
  lowestPrice: {
    option: RideOption;
    amount: number;
  };
  fastestEV: {
    option: RideOption;
    amount: number;
    eta: number;
  };
}

export interface FilterState {
  activeCategory: "all" | "giant" | "ev-local";
  maxPrice?: number;
  sortBy: "price" | "eta" | "provider" | "rating";
  showSurgeOnly: boolean;
  selectedVehicleTypes: VehicleType[];
}
