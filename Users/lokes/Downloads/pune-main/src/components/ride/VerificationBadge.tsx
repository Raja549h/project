import type { VerificationBadgeType } from "@/types/ride";
import { verificationBadges } from "@/lib/ride-data";
import { cn } from "@/lib/utils";

export function VerificationBadge({ type, className }: { type: VerificationBadgeType; className?: string }) {
  const badge = verificationBadges[type];
  if (!badge) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border leading-tight",
        badge.color,
        className,
      )}
      title={badge.description}
    >
      {type === "live-api" && (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )}
      {type === "rto-tariff" && (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )}
      {type === "ev-zero-surge" && (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z" />
          <path d="M12 6v6l4 2" />
        </svg>
      )}
      {type === "kyc-verified" && (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )}
      {type === "rider-reviewed" && (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}
      {badge.label}
    </span>
  );
}

export function BadgeGroup({ badges, className }: { badges: VerificationBadgeType[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {badges.map((type) => (
        <VerificationBadge key={type} type={type} />
      ))}
    </div>
  );
}
