import { motion } from "framer-motion";
import { ArrowUpRight, Phone, MessageSquare, ChevronRight, Gauge, ExternalLink, Star, ShieldCheck, Users } from "lucide-react";
import type { RideOption, TrustLevel } from "@/types/ride";
import { BadgeGroup } from "./VerificationBadge";
import { formatFare, formatEta } from "@/lib/ride-data";
import { cn } from "@/lib/utils";

interface RideCardProps {
  option: RideOption;
  onSelect: (option: RideOption) => void;
  category: "giant" | "ev-local";
}

const vehicleIcons: Record<string, string> = {
  auto: "🛺",
  "e-auto": "⚡🛺",
  hatchback: "🚗",
  sedan: "🚙",
  suv: "🚐",
  "ev-sedan": "⚡🚙",
  "ev-suv": "⚡🚐",
  "ev-hatchback": "⚡🚗",
};

function formatPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/** Render star rating (out of 5) */
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.3;
  const sizeClass = size === "sm" ? "w-3.5 h-3.5" : "w-3 h-3";

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        let fill: string;
        if (i < fullStars) fill = "fill-amber-400 text-amber-400";
        else if (i === fullStars && hasHalf) fill = "fill-amber-300 text-amber-300";
        else fill = "fill-muted-foreground/20 text-muted-foreground/20";
        return (
          <Star
            key={i}
            className={cn(sizeClass, fill)}
            strokeWidth={1.5}
          />
        );
      })}
    </span>
  );
}

/** Trust level badge color and icon */
const trustConfig: Record<TrustLevel, { icon: React.ReactNode; label: string; color: string }> = {
  high: {
    icon: <ShieldCheck className="w-3 h-3" />,
    label: "Trusted",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800/50",
  },
  medium: {
    icon: <ShieldCheck className="w-3 h-3" />,
    label: "Verified",
    color: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800/50",
  },
  emerging: {
    icon: <Users className="w-3 h-3" />,
    label: "New",
    color: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800/50",
  },
  limited: {
    icon: <Users className="w-3 h-3" />,
    label: "Limited",
    color: "text-muted-foreground bg-muted/50 border-border dark:text-muted-foreground dark:bg-muted/20 dark:border-border",
  },
};

export function RideCard({ option, onSelect, category }: RideCardProps) {
  const isEV = option.vehicleType.startsWith("ev") || option.vehicleType === "e-auto";
  const hasSurge = option.surgeMultiplier && option.surgeMultiplier > 1;

  const contactNumber = option.bookingData?.whatsappNumber || option.bookingData?.phone;
  const isWhatsApp = option.bookingAction === "whatsapp";

  const hasRating = option.rating && option.rating > 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(option)}
      className={cn(
        "group relative w-full text-left rounded-xl border p-4 transition-all duration-200",
        "hover:border-primary/30 hover:shadow-sm hover:bg-accent/30",
        category === "giant"
          ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
          : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50",
        option.isLowestPrice && "ring-2 ring-primary/20",
        option.isFastestEV && "ring-2 ring-emerald-400/30",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Vehicle Icon */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg",
          isEV
            ? "bg-emerald-100 dark:bg-emerald-900/40"
            : "bg-neutral-100 dark:bg-neutral-800",
        )}>
          {vehicleIcons[option.vehicleType] || "🚗"}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {option.providerName}
                </span>
                {isEV && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    EV
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold leading-tight mt-0.5">
                {option.vehicleName}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold tracking-tight">
                {formatFare(option.estimatedFare)}
              </p>
              {option.originalFare && (
                <p className="text-xs line-through text-muted-foreground">
                  {formatFare(option.originalFare)}
                </p>
              )}
            </div>
          </div>

          {/* ETA & Distance */}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Gauge className="w-3 h-3" />
              {formatEta(option.etaMinutes)}
            </span>
            <span>{option.distanceKm.toFixed(1)} km</span>
            {hasSurge && (
              <span className="text-rose-500 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                {option.surgeMultiplier?.toFixed(1)}x surge
              </span>
            )}
          </div>

          {/* ⭐ Star Rating & Trust Level */}
          {hasRating && (
            <div className="flex items-center gap-2 mt-1.5">
              <StarRating rating={option.rating!} />
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                {option.rating!.toFixed(1)}
              </span>
              {option.reviewCount && option.reviewCount > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  ({option.reviewCount >= 1000
                    ? `${(option.reviewCount / 1000).toFixed(1)}k`
                    : option.reviewCount} reviews)
                </span>
              )}
              {/* Trust level badge */}
              {option.trustLevel && (
                <span className={cn(
                  "inline-flex items-center gap-0.5 ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
                  trustConfig[option.trustLevel]?.color || "text-muted-foreground bg-muted/50 border-border"
                )}>
                  {trustConfig[option.trustLevel]?.icon}
                  {trustConfig[option.trustLevel]?.label}
                </span>
              )}
            </div>
          )}

          {/* ETA Reliability */}
          {option.etaReliability && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    option.etaReliability >= 90 ? "bg-emerald-400" :
                    option.etaReliability >= 75 ? "bg-amber-400" :
                    "bg-rose-400"
                  )}
                  style={{ width: `${option.etaReliability}%` }}
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                option.etaReliability >= 90 ? "text-emerald-600 dark:text-emerald-400" :
                option.etaReliability >= 75 ? "text-amber-600 dark:text-amber-400" :
                "text-rose-600 dark:text-rose-400"
              )}>
                {option.etaReliability}% ETA accuracy
              </span>
            </div>
          )}

          {/* Rider Feedback Snippet */}
          {option.riderFeedback && option.riderFeedback.length > 0 && (
            <p className="text-[10px] text-muted-foreground italic mt-1 leading-tight line-clamp-1">
              "{option.riderFeedback[0]}"
            </p>
          )}

          {/* Badges */}
          <div className="mt-2">
            <BadgeGroup badges={option.badges} />
          </div>

          {/* Contact Info — always visible for local EV operators */}
          {contactNumber && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              {isWhatsApp ? (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <MessageSquare className="w-3 h-3" />
                  <span className="font-mono tracking-tight">{formatPhone(contactNumber)}</span>
                </span>
              ) : option.bookingAction === "call" ? (
                <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                  <Phone className="w-3 h-3" />
                  <span className="font-mono tracking-tight">{formatPhone(contactNumber)}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  <ExternalLink className="w-3 h-3" />
                  <span>{option.bookingAction === "in-app" ? "Open App" : "Book on Website"}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Hint */}
        {option.bookingAction === "app-deep-link" && (
          <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1 text-xs font-medium text-primary">
              Open <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        )}
      </div>
    </motion.button>
  );
}
