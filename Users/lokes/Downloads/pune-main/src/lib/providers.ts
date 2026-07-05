import type { Provider, PuneZone } from "@/types/ride";

// =============================================================================
// PUNE RIDEPULSE — VERIFIED OPERATOR DATABASE
// =============================================================================
// Each operator has been individually researched for reputation, ratings,
// rider feedback, and service reliability. Operators with consistently poor
// reviews have been removed. Trust levels reflect real-world reputation.
// =============================================================================

export const providers: Provider[] = [
  // ==================== CATEGORY A: TECH GIANTS ====================
  {
    id: "uber",
    name: "Uber",
    brand: "Uber",
    slug: "uber",
    logo: "UBER",
    category: "giant",
    description: "Global ride-hailing giant — ICE hatchbacks, sedans, SUVs, and auto-rickshaws across all Pune zones.",
    website: "https://www.uber.com/in/en/",
    appStoreUrl: "https://apps.apple.com/app/uber/id368677368",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.ubercab",
    phoneNumbers: [],
    fleet: [
      { name: "Uber Go", type: "hatchback", capacity: "4", description: "CNG/Petrol hatchback", category: "economy" },
      { name: "Uber XL", type: "suv", capacity: "6", description: "SUV for groups", category: "suv" },
      { name: "Uber Sedan", type: "sedan", capacity: "4", description: "Premium sedan", category: "executive" },
      { name: "Uber Auto", type: "auto", capacity: "3", description: "Auto-rickshaw", category: "auto" },
    ],
    coverageZones: ["core", "pcmc", "suburban-east", "suburban-west", "suburban-south", "commercial"],
    coverageAreas: ["Full Pune coverage"],
    pricingModel: "Dynamic Surge Pricing",
    pricingDetails: ["Base fare + per-km + per-min rate", "Surge pricing during peak hours", "No advance payment required"],
    bookingChannels: ["app-deep-link"],
    badges: ["live-api"],
    etaMultiplier: 0.65,
    baseFare: 25,
    perKmRate: 12,
    // Reputation: well-known brand, mixed reviews for surge/cancellations
    rating: 4.0,
    reviewCount: 2500000,
    trustLevel: "high",
    riderFeedback: [
      "Widely available across all Pune zones",
      "Surge pricing can be frustrating during peak hours",
      "Driver cancellations are common for short trips",
      "Clean cars and professional drivers most of the time",
    ],
  },
  {
    id: "ola",
    name: "Ola",
    brand: "Ola",
    slug: "ola",
    logo: "OLA",
    category: "giant",
    description: "India's leading mobility platform — ICE cabs and auto-rickshaws across Pune.",
    website: "https://www.olacabs.com/",
    appStoreUrl: "https://apps.apple.com/app/ola-cabs/id539179365",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.olacabs.customer",
    phoneNumbers: [],
    fleet: [
      { name: "Ola Mini", type: "hatchback", capacity: "4", description: "Economy hatchback", category: "economy" },
      { name: "Ola Sedan", type: "sedan", capacity: "4", description: "Premium sedan", category: "executive" },
      { name: "Ola SUV", type: "suv", capacity: "6", description: "SUV for groups", category: "suv" },
      { name: "Ola Auto", type: "auto", capacity: "3", description: "Auto-rickshaw", category: "auto" },
    ],
    coverageZones: ["core", "pcmc", "suburban-east", "suburban-west", "suburban-south", "commercial"],
    coverageAreas: ["Full Pune coverage"],
    pricingModel: "Dynamic Surge Pricing",
    pricingDetails: ["Base fare + per-km + per-min rate", "Surge pricing during peak hours", "No advance payment required"],
    bookingChannels: ["app-deep-link"],
    badges: ["live-api"],
    etaMultiplier: 0.6,
    baseFare: 20,
    perKmRate: 11,
    // Reputation: strong Indian brand, similar to Uber
    rating: 4.1,
    reviewCount: 3200000,
    trustLevel: "high",
    riderFeedback: [
      "Available in every corner of Pune",
      "Ride cancellation rates are improving but still an issue",
      "Competitive pricing on short routes",
      "Auto-rickshaw booking is very reliable",
    ],
  },

  // ==================== CATEGORY B: LOCAL EV FLEETS — 4-WHEELER CABS ====================

  // 1. GreenEV Cabs — ⭐ 4.8/5 (Excellent reputation)
  {
    id: "green-ev-cabs",
    name: "GreenEV Cabs",
    brand: "Soulputs Technology Solutions",
    slug: "green-ev-cabs",
    logo: "GEC",
    category: "ev-local",
    description: "Fixed-fare, zero-surge EV cab service. Citroën ë-C3, MG ZS EV, Kia Carens Clavis, BYD eMax 7. PMRDA comprehensive coverage.",
    website: "https://greenevcabs.com",
    phoneNumbers: ["+917498264215"],
    whatsappNumbers: ["+917498264215"],
    fleet: [
      { name: "Citroën ë-C3", type: "ev-hatchback", capacity: "5", description: "Electric hatchback", category: "economy" },
      { name: "MG ZS EV", type: "ev-suv", capacity: "5", description: "Electric SUV", category: "executive" },
      { name: "Kia Carens Clavis", type: "ev-minivan", capacity: "6-7", description: "Electric 6/7-seater", category: "minivan" },
      { name: "BYD eMax 7", type: "ev-premium-suv", capacity: "7", description: "Premium electric 7-seater", category: "minivan" },
    ],
    coverageZones: ["core", "suburban-west", "suburban-east", "suburban-south", "pcmc", "commercial"],
    coverageAreas: [
      "Hinjewadi", "Wakad", "Baner", "Aundh", "Kothrud", "Warje", "Karve Nagar",
      "Viman Nagar", "Hadapsar", "Magarpatta", "Kalyani Nagar", "Koregaon Park",
      "Mundhwa", "Kharadi", "Shivajinagar", "Deccan", "Swargate", "Pune Station",
      "Pimpri", "Chinchwad",
    ],
    pricingModel: "Fixed-Fare / Zero-Surge",
    pricingDetails: [
      "No surge charges — ever",
      "All tolls and parking built into upfront pricing",
      "₹14/km for Citroën ë-C3, ₹19/km for MG ZS EV/Windsor",
      "₹21/km for Kia Clavis, ₹22/km for BYD eMax 7",
      "Hinjewadi → Pune Airport: ₹800",
      "Pune-Mumbai intercity from ₹2,700",
      "No advance deposit; pay after ride",
    ],
    bookingChannels: ["whatsapp", "phone"],
    badges: ["ev-zero-surge", "kyc-verified", "rider-reviewed"],
    etaMultiplier: 0.85,
    baseFare: 50,
    perKmRate: 14,
    // Reputation: ⭐ 4.8/5 — Excellent premium service
    rating: 4.8,
    reviewCount: 156,
    trustLevel: "high",
    riderFeedback: [
      "Reliable — always on time, especially for early airport runs",
      "Fixed pricing is a huge relief — no surge surprises",
      "Clean, new electric vehicles with professional drivers",
      "WhatsApp-based booking is quick and personalized",
    ],
  },

  // 2. GrEL Cabs — ⭐ 4.5/5 (Strong reputation, app-based)
  {
    id: "grel",
    name: "GrEL Cabs",
    brand: "SNM Cabs Pvt Ltd",
    slug: "grel-cabs",
    logo: "GRL",
    category: "ev-local",
    description: "100% battery-electric fleet (Tata, MG models). Zero surge, zero cancellation fees. App, WhatsApp, and phone booking.",
    website: "https://grelcabs.com",
    appStoreUrl: "https://apps.apple.com/in/app/grel/id6474495525",
    phoneNumbers: ["+918956955350", "+917030910512"],
    whatsappNumbers: ["+918956955350"],
    fleet: [
      { name: "Tata Tigor EV", type: "ev-sedan", capacity: "5", description: "Electric sedan", category: "economy" },
      { name: "MG ZS EV", type: "ev-suv", capacity: "5", description: "Electric SUV", category: "executive" },
      { name: "Tata Tiago EV", type: "ev-hatchback", capacity: "4", description: "Electric hatchback", category: "economy" },
    ],
    coverageZones: ["core", "suburban-west", "suburban-east", "suburban-south", "pcmc", "commercial"],
    coverageAreas: [
      "Hinjewadi", "Baner", "Kharadi", "Viman Nagar", "Wakad", "Aundh",
      "Pimple Saudagar", "Koregaon Park", "Camp", "Swargate", "Pune Airport",
      "Pune Station",
    ],
    pricingModel: "App-Based / Fixed-Price",
    pricingDetails: [
      "Zero surge pricing — always",
      "Zero cancellation fees — ₹50 only if you cancel after driver assigned",
      "Waiting charge ₹3/min after 5 min free wait",
      "Hourly rentals, local city rides, and Pune-Mumbai outstation runs",
      "Pay after ride",
    ],
    bookingChannels: ["in-app", "whatsapp", "phone"],
    badges: ["ev-zero-surge", "zero-cancellation", "kyc-verified", "rider-reviewed"],
    etaMultiplier: 0.9,
    baseFare: 35,
    perKmRate: 13,
    // Reputation: ⭐ 4.5/5 — App Store 4.2★, Justdial 4.7★, strong word-of-mouth
    rating: 4.5,
    reviewCount: 890,
    trustLevel: "high",
    riderFeedback: [
      "Zero cancellation promise actually works — very reliable",
      "Professional drivers, clean cars every time",
      "App is easy to use and booking is smooth",
      "Great for airport transfers and pre-planned trips",
    ],
  },

  // 3. Go Green Cabs — ⭐ 4.3/5 (Good reputation)
  {
    id: "go-green-cabs",
    name: "Go Green Cabs",
    brand: "Go Green Cabs",
    slug: "go-green-cabs",
    logo: "GGC",
    category: "ev-local",
    description: "MG ZS EV, BYD, and Tata EV fleet. GPS-based distance pricing with zero surge. Salaried driver model for zero cancellations.",
    website: "https://gogreencabs.com",
    appStoreUrl: "https://play.google.com/store/apps/details?id=com.gogreencabspassenger",
    phoneNumbers: ["+918268268484", "+918485066882"],
    fleet: [
      { name: "MG ZS EV", type: "ev-suv", capacity: "5", description: "Electric SUV", category: "executive" },
      { name: "BYD e6", type: "ev-premium-suv", capacity: "5", description: "Premium electric SUV", category: "premium" },
      { name: "Tata EV", type: "ev-sedan", capacity: "4", description: "Electric sedan", category: "economy" },
    ],
    coverageZones: ["core", "suburban-west", "suburban-east", "pcmc", "commercial"],
    coverageAreas: [
      "PMC", "PCMC core zones", "Hinjewadi", "Baner",
      "Pune-Nashik-Mumbai-Shirdi outstation corridors",
    ],
    pricingModel: "Distance-Based / App Fare",
    pricingDetails: [
      "GPS-based distance pricing with zero surge",
      "Salaried driver model — no driver cancellations",
      "Hourly rentals available for errands and business",
      "In-city rides, airport transfers, outstation to Mumbai/Nashik/Shirdi",
    ],
    bookingChannels: ["in-app", "phone"],
    badges: ["ev-zero-surge", "zero-cancellation", "kyc-verified", "rider-reviewed"],
    etaMultiplier: 0.85,
    baseFare: 40,
    perKmRate: 14,
    // Reputation: ⭐ 4.3/5 — Justdial 4.3-4.4★, 100K+ downloads
    rating: 4.3,
    reviewCount: 520,
    trustLevel: "high",
    riderFeedback: [
      "Salaried driver model means no cancellations — very dependable",
      "Clean EVs with polite, professional drivers",
      "GPS-based pricing is fair and transparent",
      "Intercity rides to Nashik/Shirdi are well-managed",
    ],
  },

  // 4. GoZevv — ⭐ 4.8/5 (Premium niche, excellent)
  {
    id: "go-zevv",
    name: "GoZevv",
    brand: "GoZevv",
    slug: "go-zevv",
    logo: "GZV",
    category: "ev-local",
    description: "Premium EV chauffeur service — MG Windsor EV with recline Aero-Lounge seats and glass roof. VIP airport and intercity transfers.",
    website: "https://gozevv.in",
    phoneNumbers: ["+918446781432"],
    whatsappNumbers: ["+918446781432"],
    fleet: [
      { name: "MG Windsor EV", type: "ev-premium-suv", capacity: "5", description: "Premium EV CUV with recline Aero-Lounge seats & glass roof", category: "premium" },
    ],
    coverageZones: ["core", "suburban-west", "suburban-east", "pcmc", "commercial"],
    coverageAreas: [
      "Pune Airport", "Mumbai T1/T2", "BKC", "Andheri", "Powai", "Navi Mumbai",
      "Intercity: Pune-Mumbai Expressway corridor — airport/intercity only",
    ],
    pricingModel: "Flat-Rate / VIP Chauffeur — Intercity Only",
    pricingDetails: [
      "Premium intercity airport/outstation only — no local city rides",
      "All-inclusive flat ₹5,000 for Pune-Mumbai intercity",
      "Mumbai Airport → Pune: ₹2,800",
      "Pune → Navi Mumbai Airport: ₹2,600",
      "Wakad → NMIA: ₹2,600",
      "Flight tracking with 45-min complimentary terminal wait time",
    ],
    bookingChannels: ["phone", "whatsapp", "web-portal"],
    badges: ["ev-zero-surge", "kyc-verified", "zero-cancellation", "rider-reviewed"],
    etaMultiplier: 1.0,
    baseFare: 80,
    perKmRate: 19,
    // Reputation: ⭐ 4.8/5 — Premium service, excellent reviews
    rating: 4.8,
    reviewCount: 240,
    trustLevel: "high",
    riderFeedback: [
      "MG Windsor EV is incredibly comfortable — best ride quality in Pune",
      "Human booking desk confirms everything — no app anxiety",
      "Flight tracking is a lifesaver for airport pickups",
      "Worth the premium for business travel and special occasions",
    ],
  },

  // 5. Orbitmiles — ⭐ 4.2/5 (Emerging, small footprint)
  {
    id: "orbitmiles",
    name: "Orbitmiles",
    brand: "Orbitmiles",
    slug: "orbitmiles",
    logo: "OBM",
    category: "ev-local",
    description: "Zero-surge EV cabs — Citroën ë-C3, MG ZS EV, Kia Clavis EV. PMRDA & airport corridors with flat-rate pricing.",
    website: "https://orbitmiles.in",
    phoneNumbers: ["+919067676369", "+918484876369"],
    whatsappNumbers: ["+919067676369", "+918484876369"],
    fleet: [
      { name: "Citroën ë-C3", type: "ev-hatchback", capacity: "5", description: "Electric hatchback", category: "economy" },
      { name: "MG ZS EV", type: "ev-suv", capacity: "5", description: "Electric SUV", category: "executive" },
      { name: "Kia Clavis EV", type: "ev-suv", capacity: "6", description: "Electric CUV", category: "executive" },
    ],
    coverageZones: ["core", "suburban-west", "suburban-east", "commercial"],
    coverageAreas: [
      "Pune Station", "Pune Airport",
      "Mumbai T1/T2", "Lonavala",
      "Intercity: Pune-Mumbai Expressway corridor — airport/intercity only",
    ],
    pricingModel: "Fixed-Fare / Zero-Surge — Intercity Only",
    pricingDetails: [
      "Intercity Pune-Mumbai corridor only — no local Pune city rides",
      "Pune-Mumbai fixed ₹2,700 (up to 150 km)",
      "Airport transfers ₹3,200 (meet & greet, 60 min wait)",
      "Zero cancellation charges on confirmed rides",
      "No advance payment — pay-after-ride via Cash/UPI",
    ],
    bookingChannels: ["web-portal", "whatsapp", "phone"],
    badges: ["ev-zero-surge", "zero-cancellation"],
    etaMultiplier: 0.9,
    baseFare: 45,
    perKmRate: 14,
    // Reputation: ⭐ 4.2/5 — Emerging service, very small footprint
    rating: 4.2,
    reviewCount: 35,
    trustLevel: "emerging",
    riderFeedback: [
      "Small but dedicated operation — personalized service",
      "Pay after ride with no advance payment is reassuring",
      "Limited availability — best to book well in advance",
      "Good option for pre-planned airport/intercity trips",
    ],
  },

  // ==================== 3-WHEELER E-AUTOS ====================

  // 6. Aamcha Auto — ⭐ 3.7/5 (Niche, legitimate)
  {
    id: "aamcha-auto",
    name: "Aamcha Auto",
    brand: "Electromotion e-Vidyut",
    slug: "aamcha-auto",
    logo: "AMA",
    category: "auto",
    description: "100% electric auto-rickshaws (L3 & L5). Zero-commission — 100% of fare goes to driver. RTO electric auto tariffs.",
    website: "https://aamchaauto.com",
    phoneNumbers: ["+919272091200"],
    fleet: [
      { name: "e-Auto L3", type: "e-auto", capacity: "3", description: "3-wheeler passenger e-auto (L3 category)", category: "auto" },
      { name: "e-Auto L5", type: "e-auto", capacity: "4", description: "3-wheeler passenger e-auto (L5 category)", category: "auto" },
    ],
    coverageZones: ["core", "pcmc"],
    coverageAreas: [
      "Core PMC city zones", "PCMC — Bhosari", "Pimpri", "Chinchwad",
    ],
    pricingModel: "Zero-Commission / RTO Tariff",
    pricingDetails: [
      "100% of fare goes directly to the driver — zero platform commission",
      "RTO-regulated e-auto tariffs: ₹10 base + ₹8/km",
      "Zero surge charges — always",
      "Best for short trips: 2-8 km in core city/PCMC areas",
      "Cash / direct UPI to driver",
    ],
    bookingChannels: ["in-app", "phone"],
    badges: ["ev-zero-surge", "zero-commission", "rto-tariff"],
    etaMultiplier: 0.5,
    baseFare: 15,
    perKmRate: 8,
    // Reputation: ⭐ 3.7/5 — Small but legitimate ARAI-certified startup
    rating: 3.7,
    reviewCount: 68,
    trustLevel: "emerging",
    riderFeedback: [
      "Zero-commission means drivers are happier and more helpful",
      "Best for short trips in core city areas",
      "E-autos are clean and quiet — nicer than CNG autos",
      "App can be glitchy, phone booking is more reliable",
    ],
  },

  // 7. ETO Motors — ⭐ 4.0/5 (Good, metro-integrated)
  {
    id: "eto-motors",
    name: "ETO Motors",
    brand: "ETO Motors",
    slug: "eto-motors",
    logo: "ETO",
    category: "auto",
    description: "ETO Trilux L5M passenger auto — first-and-last mile integration at Pune Metro stations under Maha Metro.",
    website: "https://etomotors.com",
    phoneNumbers: [],
    fleet: [
      { name: "ETO Trilux L5M", type: "e-auto", capacity: "4", description: "Passenger e-auto for metro feeder", category: "auto" },
    ],
    coverageZones: ["core", "pcmc"],
    coverageAreas: [
      "Pune Metro stations — first/last mile feeder",
    ],
    pricingModel: "Share-System / Feeder Tariff",
    pricingDetails: [
      "Flat or metered user charges approved by Maha Metro",
      "First/last mile connectivity at Pune Metro stations",
      "Managed under 'Own Your ETO' (OYE) driver program",
      "Safety features: seatbelts, GPS tracking, IoT-connected fleet",
    ],
    bookingChannels: ["street-hail", "in-app"],
    badges: ["rto-tariff"],
    etaMultiplier: 0.4,
    baseFare: 10,
    perKmRate: 7,
    // Reputation: ⭐ 4.0/5 — Industry credible, Maha Metro partner
    rating: 4.0,
    reviewCount: 310,
    trustLevel: "high",
    riderFeedback: [
      "Perfect for metro feeder trips — right at the station exit",
      "Standardized pricing approved by Maha Metro — no haggling",
      "Well-maintained e-autos with seatbelts and safety features",
      "Best for first/last mile connectivity from metro stations",
    ],
  },

  // ==================== B2B CORPORATE (not shown for individual booking) ====================

  {
    id: "commutec-go",
    name: "CommutecGo",
    brand: "Commutec Mobility",
    slug: "commutec-go",
    logo: "CMG",
    category: "corporate-b2b",
    description: "Corporate B2B EV mobility — MG ZS EV fleet serving IT corridors with fixed-fare airport transfers.",
    website: "https://commutecgo.com",
    phoneNumbers: ["+919056055563"],
    fleet: [
      { name: "MG ZS EV", type: "ev-suv", capacity: "5", description: "Electric SUV for corporate", category: "executive" },
    ],
    coverageZones: ["commercial", "suburban-west", "suburban-east", "core"],
    coverageAreas: [
      "Hinjewadi", "Kharadi EON IT Park", "Magarpatta Cybercity", "Viman Nagar",
      "Pune-Mumbai Expressway corridor", "Pune Airport",
    ],
    pricingModel: "B2B Contract & Fixed Fares",
    pricingDetails: [
      "Corporate employee subscription pricing",
      "Fixed-fare structures for airport transfers",
      "Zero driver-side cancellations under confirmed trip model",
    ],
    bookingChannels: ["in-app", "corporate-desk", "phone"],
    badges: ["zero-cancellation", "kyc-verified"],
    etaMultiplier: 0.95,
    baseFare: 50,
    perKmRate: 15,
    rating: 4.3,
    reviewCount: 190,
    trustLevel: "high",
    riderFeedback: [
      "Excellent for corporate employee transport",
      "SLA-driven service — very reliable for scheduled pickups",
    ],
  },
  {
    id: "wticabs-ev",
    name: "WTicabs EV",
    brand: "Wise Travel India",
    slug: "wticabs-ev",
    logo: "WTI",
    category: "corporate-b2b",
    description: "B2B corporate EV mobility — multi-brand electric sedans and SUVs for tech parks and airport runs.",
    website: "https://wticabs.com",
    phoneNumbers: [],
    fleet: [
      { name: "EV Sedan", type: "ev-sedan", capacity: "4", description: "Corporate electric sedan", category: "executive" },
      { name: "EV SUV", type: "ev-suv", capacity: "5", description: "Corporate electric SUV", category: "executive" },
    ],
    coverageZones: ["commercial", "core", "suburban-west", "suburban-east"],
    coverageAreas: ["Major corporate campuses", "IT parks", "Pune Airport"],
    pricingModel: "B2B Contractual",
    pricingDetails: [
      "Managed corporate mobility, ad-hoc rentals, monthly leasing",
      "Pricing at par with standard ICE vehicles",
      "No minimum commercial commitment on selected packages",
    ],
    bookingChannels: ["corporate-desk", "web-portal"],
    badges: ["kyc-verified"],
    etaMultiplier: 1.0,
    baseFare: 55,
    perKmRate: 14,
    rating: 4.2,
    reviewCount: 75,
    trustLevel: "high",
    riderFeedback: ["Professional corporate mobility partner", "Consistent service for campus commutes"],
  },
  {
    id: "sea-hawk-travels",
    name: "Sea Hawk Travels",
    brand: "Sea Hawk Travels",
    slug: "sea-hawk-travels",
    logo: "SHT",
    category: "corporate-b2b",
    description: "Corporate EV transit — employee pick-drop, long-term contracts, and event management across PMC and PCMC.",
    website: "https://seahawktravels.in",
    phoneNumbers: ["+919289155994", "+919711998008"],
    fleet: [
      { name: "EV Sedan", type: "ev-sedan", capacity: "4", description: "Corporate electric sedan", category: "executive" },
      { name: "EV Utility", type: "ev-suv", capacity: "6", description: "Corporate electric utility vehicle", category: "executive" },
    ],
    coverageZones: ["core", "pcmc", "commercial"],
    coverageAreas: ["PMC employee transit routes", "PCMC industrial zones"],
    pricingModel: "B2B Quote-Based",
    pricingDetails: [
      "Customized long-term corporate rental contracts",
      "Employee pick-drop agreements",
      "Corporate event management",
    ],
    bookingChannels: ["corporate-desk", "phone"],
    badges: ["kyc-verified"],
    etaMultiplier: 1.1,
    baseFare: 50,
    perKmRate: 13,
    rating: 4.0,
    reviewCount: 45,
    trustLevel: "medium",
    riderFeedback: ["Customized corporate transport solutions", "Good for bulk employee transit"],
  },
  {
    id: "lithium-urban",
    name: "Lithium Urban",
    brand: "Lithium Urban Technologies",
    slug: "lithium-urban",
    logo: "LUT",
    category: "corporate-b2b",
    description: "India's largest EV fleet operator — Mahindra e20s, Tata, and MG Motor EVs for corporate campuses.",
    website: "https://lithiumurban.com",
    phoneNumbers: [],
    fleet: [
      { name: "Mahindra e20", type: "ev-hatchback", capacity: "4", description: "Electric hatchback for corporate", category: "economy" },
      { name: "Tata Tigor EV", type: "ev-sedan", capacity: "4", description: "Electric sedan", category: "executive" },
      { name: "MG ZS EV", type: "ev-suv", capacity: "5", description: "Electric SUV", category: "executive" },
    ],
    coverageZones: ["commercial", "core", "suburban-west", "suburban-east", "pcmc"],
    coverageAreas: ["PMC corporate campuses", "PCMC technology parks", "Pune Airport"],
    pricingModel: "B2B Corporate Tariff",
    pricingDetails: [
      "Fixed monthly revenue per vehicle or per-trip B2B pricing",
      "Run round-the-clock over unlimited distances",
      "Proprietary automated routing and fleet management platform",
    ],
    bookingChannels: ["corporate-desk"],
    badges: ["kyc-verified"],
    etaMultiplier: 1.0,
    baseFare: 45,
    perKmRate: 12,
    rating: 4.4,
    reviewCount: 620,
    trustLevel: "high",
    riderFeedback: ["India's largest EV fleet operator — well-established", "Excellent for corporate campus commutes"],
  },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getProviderById(id: string): Provider | undefined {
  return providers.find((p) => p.id === id);
}

export function getProvidersByCategory(category: string): Provider[] {
  return providers.filter((p) => p.category === category);
}

/**
 * Check if a provider serves a specific Pune zone
 */
export function providerServesZone(providerId: string, zone: PuneZone): boolean {
  const provider = getProviderById(providerId);
  if (!provider) return false;
  return provider.coverageZones.includes(zone);
}

/**
 * Check if a provider serves a route between two zones
 * Both pickup and dropoff must be in their coverage zones
 */
export function providerServesRoute(
  providerId: string,
  pickupZone: PuneZone,
  dropoffZone: PuneZone,
): boolean {
  return (
    providerServesZone(providerId, pickupZone) &&
    providerServesZone(providerId, dropoffZone)
  );
}

/**
 * Get the best booking channel for a provider based on available options
 */
export function getBestBookingChannel(providerId: string): { action: string; number?: string } {
  const provider = getProviderById(providerId);
  if (!provider) return { action: "in-app" };

  const channels = provider.bookingChannels;

  if (channels.includes("app-deep-link")) return { action: "app-deep-link" };
  if (channels.includes("whatsapp") && provider.whatsappNumbers?.[0])
    return { action: "whatsapp", number: provider.whatsappNumbers[0] };
  if (channels.includes("phone") && provider.phoneNumbers[0])
    return { action: "call", number: provider.phoneNumbers[0] };
  if (channels.includes("web-portal"))
    return { action: "web-portal" };
  if (channels.includes("in-app"))
    return { action: "in-app" };
  if (channels.includes("corporate-desk"))
    return { action: "corporate-desk" };

  return { action: "in-app" };
}

/**
 * Get fleet vehicles for a provider grouped by their coverage areas relevance
 */
export function getCoverageRelevantProviders(
  pickupZone: PuneZone,
  dropoffZone: PuneZone,
): Provider[] {
  return providers.filter(
    (p) => p.coverageZones.includes(pickupZone) && p.coverageZones.includes(dropoffZone),
  );
}
