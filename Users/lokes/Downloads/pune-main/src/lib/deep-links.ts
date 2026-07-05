/**
 * Deep linking utilities for all ride providers.
 * Uses REAL contact numbers and booking channels from Pune EV operators.
 */

import { providers } from "./providers";

interface DeepLinkParams {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  pickupLabel?: string;
  dropoffLabel?: string;
}

/** Generate Uber deep link */
export function getUberDeepLink(params: DeepLinkParams): string {
  const { pickupLat, pickupLng, dropoffLat, dropoffLng, pickupLabel, dropoffLabel } = params;
  const pickup = pickupLabel ? `${pickupLabel}@${pickupLat},${pickupLng}` : `${pickupLat},${pickupLng}`;
  const dropoff = dropoffLabel ? `${dropoffLabel}@${dropoffLat},${dropoffLng}` : `${dropoffLat},${dropoffLng}`;
  return `uber://?action=setPickup&pickup=${pickup}&dropoff=${dropoff}`;
}

/** Generate Ola deep link */
export function getOlaDeepLink(params: DeepLinkParams): string {
  const { pickupLat, pickupLng, dropoffLat, dropoffLng } = params;
  return `olacabs://?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}&drop_lat=${dropoffLat}&drop_lng=${dropoffLng}`;
}

/** WhatsApp message link */
export function getWhatsAppLink(phone: string, message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encoded}`;
}

/** Click-to-call link */
export function getCallLink(phone: string): string {
  return `tel:${phone.replace(/[^0-9]/g, "")}`;
}

/** Generate a WhatsApp booking message with real route details */
export function generateEVBookingMessage(
  operatorName: string,
  pickupName: string,
  dropoffName: string,
  vehicleType: string,
  estimatedFare: number,
): string {
  return `Hi ${operatorName}! I'd like to book a ride through Pune RidePulse.
🚗 Vehicle: ${vehicleType}
📍 Pickup: ${pickupName}
🎯 Drop-off: ${dropoffName}
💰 Estimated Fare: ₹${estimatedFare}
✅ Please confirm availability and ETA.`;
}

/** Handle booking action for any provider */
export function executeBookingAction(
  providerId: string,
  option: { bookingAction: string; bookingData?: { phone?: string; whatsappNumber?: string } },
  pickup: { name: string; coordinates: [number, number] },
  dropoff: { name: string; coordinates: [number, number] },
  vehicleName: string,
  estimatedFare: number,
) {
  const provider = providers.find((p) => p.id === providerId);

  switch (option.bookingAction) {
    case "app-deep-link":
      // Uber/Ola — deep link to their apps
      if (providerId === "uber") {
        window.open(getUberDeepLink({
          pickupLat: pickup.coordinates[0],
          pickupLng: pickup.coordinates[1],
          dropoffLat: dropoff.coordinates[0],
          dropoffLng: dropoff.coordinates[1],
          pickupLabel: pickup.name,
          dropoffLabel: dropoff.name,
        }), "_blank");
      } else if (providerId === "ola") {
        window.open(getOlaDeepLink({
          pickupLat: pickup.coordinates[0],
          pickupLng: pickup.coordinates[1],
          dropoffLat: dropoff.coordinates[0],
          dropoffLng: dropoff.coordinates[1],
        }), "_blank");
      }
      break;

    case "whatsapp": {
      // WhatsApp booking — use the operator's real number
      const number = option.bookingData?.whatsappNumber || provider?.whatsappNumbers?.[0];
      if (number) {
        const message = generateEVBookingMessage(
          provider?.name || providerId,
          pickup.name,
          dropoff.name,
          vehicleName,
          estimatedFare,
        );
        window.open(getWhatsAppLink(number, message), "_blank");
      }
      break;
    }

    case "call": {
      // Direct call — use the operator's real phone
      const number = option.bookingData?.phone || provider?.phoneNumbers?.[0];
      if (number) {
        window.open(getCallLink(number), "_blank");
      }
      break;
    }

    case "web-portal": {
      // Open their website
      if (provider?.website) {
        window.open(provider.website, "_blank");
      }
      break;
    }

    case "in-app": {
      // Try to open their app, fallback to website
      if (provider?.appStoreUrl) {
        window.open(provider.appStoreUrl, "_blank");
      } else if (provider?.website) {
        window.open(provider.website, "_blank");
      }
      break;
    }
  }
}

/** Get booking instructions for display */
export function getBookingInstructions(providerId: string): string {
  const provider = providers.find((p) => p.id === providerId);
  if (!provider) return "";

  if (provider.whatsappNumbers?.length) {
    return `WhatsApp ${provider.whatsappNumbers[0]}`;
  }
  if (provider.phoneNumbers?.length) {
    return `Call ${provider.phoneNumbers[0]}`;
  }
  if (provider.website) {
    return `Book at ${provider.website}`;
  }
  return "";
}

/** Fallback web URLs */
export function getProviderWebUrl(providerId: string, params: DeepLinkParams): string {
  const { pickupLat, pickupLng, dropoffLat, dropoffLng } = params;
  switch (providerId) {
    case "uber":
      return `https://m.uber.com/ul/?client_id=&action=setPickup&pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&dropoff[latitude]=${dropoffLat}&dropoff[longitude]=${dropoffLng}`;
    case "ola":
      return `https://book.olacabs.com/?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}&drop_lat=${dropoffLat}&drop_lng=${dropoffLng}`;
    default:
      return providers.find((p) => p.id === providerId)?.website || "#";
  }
}
