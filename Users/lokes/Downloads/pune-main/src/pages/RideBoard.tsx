import { motion } from "framer-motion";
import { Leaf, Building2, Gauge, Zap, BarChart3, Wallet, MapPin } from "lucide-react";
import PuneMap from "@/components/map/PuneMap";
import { BottomSheet } from "@/components/layout/BottomSheet";
import { LocationSearch } from "@/components/search/LocationSearch";
import { CategoryFilter } from "@/components/filters/CategoryFilter";
import { RideCard } from "@/components/ride/RideCard";
import { useRideComparison } from "@/lib/use-ride-comparison";
import { formatFare, formatEta } from "@/lib/ride-data";
import { createCustomLocation } from "@/lib/pune-locations";
import { cn } from "@/lib/utils";

export default function RideBoard() {
  const {
    pickup,
    dropoff,
    result,
    isLoading,
    filter,
    filteredCategoryA,
    filteredCategoryB,
    mapPickMode,
    setMapPickMode,
    setFilter,
    handleSearch,
    handleSwap,
    handleSelectRide,
    handlePickupChange,
    handleDropoffChange,
    routePoints,
    pricePins,
  } = useRideComparison();

  const activeView = filter.activeCategory;
  const totalCount = filteredCategoryA.length + filteredCategoryB.length;
  const hasResults = result !== null;
  const isMapActive = mapPickMode !== null;

  // When user taps on the map in pick mode, create a custom location
  const handleMapClick = (lat: number, lng: number) => {
    const custom = createCustomLocation(lat, lng);
    if (mapPickMode === "pickup") {
      handlePickupChange(custom);
    } else if (mapPickMode === "dropoff") {
      handleDropoffChange(custom);
    }
  };

  return (
    <div className="h-dvh w-full flex flex-col bg-background overflow-hidden relative">
      {/* Top: Map Section */}
      <div className={cn(
        "relative transition-all duration-300",
        hasResults ? "h-[45dvh]" : "h-[55dvh]",
      )}>
        {/* Search Overlay */}
        <div className="absolute top-0 left-0 right-0 z-[1000] p-3 pt-safe pt-4 bg-gradient-to-b from-black/30 to-transparent pointer-events-none">
          <div className="pointer-events-auto">
            <LocationSearch
              pickup={pickup}
              dropoff={dropoff}
              onPickupChange={handlePickupChange}
              onDropoffChange={handleDropoffChange}
              onSwap={handleSwap}
              onSearch={handleSearch}
              onRequestMapPick={(mode) => setMapPickMode(mode)}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Map */}
        <PuneMap
          pickup={pickup}
          dropoff={dropoff}
          routePoints={routePoints}
          pricePins={pricePins}
          mapPickMode={mapPickMode}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={true}
        onClose={() => {}}
        snapPoints={isMapActive ? [15, 25] : [25, 45, 55, 80]}
        headerContent={
          isMapActive ? (
            <div className="flex items-center justify-center gap-2 py-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                Tap the map to set {mapPickMode === "pickup" ? "pickup" : "drop-off"} location
              </span>
              <button
                onClick={() => setMapPickMode(null)}
                className="ml-2 text-xs text-muted-foreground underline hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : hasResults ? (
            <div className="space-y-2">
              {/* Route Summary */}
              {result && (
                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                  <span className="truncate max-w-[120px]">{result.pickup.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground">{result.route.distanceKm} km</span>
                    <span>·</span>
                    <span>{formatEta(result.route.durationMinutes)}</span>
                  </div>
                  <span className="truncate max-w-[120px] text-right">{result.dropoff.name}</span>
                </div>
              )}

              {/* Category Filter */}
              <CategoryFilter
                active={activeView}
                onChange={(v) => setFilter((f) => ({ ...f, activeCategory: v }))}
                counts={{
                  giant: filteredCategoryA.length,
                  evLocal: filteredCategoryB.length,
                }}
              />

              {/* Quick Stats */}
              <div className="flex items-center gap-2">
                <QuickStat
                  icon={<Wallet className="w-3 h-3" />}
                  label="From"
                  value={result ? formatFare(result.lowestPrice.amount) : "—"}
                  highlight
                />
                <QuickStat
                  icon={<Zap className="w-3 h-3" />}
                  label="EV from"
                  value={result ? formatFare(result.fastestEV.amount) : "—"}
                  color="emerald"
                />
                <QuickStat
                  icon={<Gauge className="w-3 h-3" />}
                  label="Rides"
                  value={`${result ? result.categoryA.length + result.categoryB.length : 0}`}
                />
              </div>
            </div>
          ) : null
        }
        className={cn(
          hasResults ? "" : "pointer-events-auto",
        )}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Scanning fares across Pune... ({pickup?.name} → {dropoff?.name})
            </p>
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasResults && !isMapActive && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-border/50 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary/40" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Compare Rides Across Pune</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Set your pickup and drop-off to compare Uber, Ola, and local 100% EV operators side-by-side.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-xs mt-2">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-2.5 text-left">
                <Building2 className="w-4 h-4 text-blue-500 mb-1" />
                <p className="text-xs font-medium">Uber · Ola</p>
                <p className="text-[10px] text-muted-foreground">ICE & Auto options</p>
              </div>
              <div className="rounded-lg border border-emerald-200/50 bg-emerald-50/30 dark:bg-emerald-950/20 p-2.5 text-left">
                <Leaf className="w-4 h-4 text-emerald-500 mb-1" />
                <p className="text-xs font-medium">100% EV Local</p>
                <p className="text-[10px] text-muted-foreground">Zero-surge pricing</p>
              </div>
            </div>
          </div>
        )}

        {/* Map mode hint */}
        {!isLoading && !hasResults && isMapActive && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Tap on the blue region above to pin a location
          </div>
        )}

        {/* Results */}
        {!isLoading && hasResults && (
          <div className="space-y-3 pb-4">
            {/* Custom location notice */}
            {(pickup?.isCustom || dropoff?.isCustom) && (
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200/50">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    {pickup?.isCustom && "Pickup pinned on map "}
                    {pickup?.isCustom && dropoff?.isCustom && "& "}
                    {dropoff?.isCustom && "Drop-off pinned on map"}
                  </p>
                </div>
              </div>
            )}

            {/* Category A: Giants */}
            {(activeView === "all" || activeView === "giant") && filteredCategoryA.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-semibold">Uber & Ola · ICE & Auto</h3>
                  <span className="text-[11px] text-muted-foreground ml-auto">
                    {filteredCategoryA.length} options
                  </span>
                </div>
                <div className="space-y-2">
                  {filteredCategoryA.map((option) => (
                    <RideCard
                      key={option.id}
                      option={option}
                      onSelect={handleSelectRide}
                      category="giant"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {activeView === "all" && filteredCategoryA.length > 0 && filteredCategoryB.length > 0 && (
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                    vs
                  </span>
                </div>
              </div>
            )}

            {/* Category B: EV Local */}
            {(activeView === "all" || activeView === "ev-local") && filteredCategoryB.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold">100% EV · Local Fleets</h3>
                  <span className="text-[11px] text-muted-foreground ml-auto">
                    {filteredCategoryB.length} options
                  </span>
                </div>
                <div className="space-y-2">
                  {filteredCategoryB.map((option) => (
                    <RideCard
                      key={option.id}
                      option={option}
                      onSelect={handleSelectRide}
                      category="ev-local"
                    />
                  ))}
                </div>
                <div className="mt-3 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/50">
                  <div className="flex items-start gap-2">
                    <Leaf className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Zero-Surge Guarantee
                      </p>
                      <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
                        All local EV operators follow RTO-approved tariff structures with no surge pricing. Fares are verified through official rate sheets.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty filter result */}
            {totalCount === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No rides match your current filters.</p>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Floating "Compare" FAB */}
      {!hasResults && pickup && dropoff && pickup.id !== dropoff.id && !isLoading && !isMapActive && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg flex items-center justify-center gap-2 text-sm"
          onClick={handleSearch}
        >
          <BarChart3 className="w-4 h-4" />
          Compare Fares — {pickup.name} → {dropoff.name}
        </motion.button>
      )}
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  highlight,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs",
      highlight
        ? "bg-primary/5 border-primary/20"
        : color === "emerald"
          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50"
          : "bg-muted/30 border-border/50",
    )}>
      <span className={cn(
        "flex-shrink-0",
        highlight && "text-primary",
        color === "emerald" && "text-emerald-500",
      )}>
        {icon}
      </span>
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        "font-semibold",
        highlight && "text-primary",
        color === "emerald" && "text-emerald-600 dark:text-emerald-400",
      )}>
        {value}
      </span>
    </div>
  );
}
