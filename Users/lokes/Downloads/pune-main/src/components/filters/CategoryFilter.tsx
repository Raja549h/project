import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Building2, Leaf, Layers } from "lucide-react";

type FilterView = "all" | "giant" | "ev-local";

interface CategoryFilterProps {
  active: FilterView;
  onChange: (view: FilterView) => void;
  counts: { giant: number; evLocal: number };
}

export function CategoryFilter({ active, onChange, counts }: CategoryFilterProps) {
  const tabs: { key: FilterView; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: "all",
      label: "All Rides",
      icon: <Layers className="w-3.5 h-3.5" />,
      count: counts.giant + counts.evLocal,
    },
    {
      key: "giant",
      label: "Uber · Ola",
      icon: <Building2 className="w-3.5 h-3.5" />,
      count: counts.giant,
    },
    {
      key: "ev-local",
      label: "100% EV Local",
      icon: <Leaf className="w-3.5 h-3.5" />,
      count: counts.evLocal,
    },
  ];

  return (
    <div className="flex gap-1 p-1 bg-muted/60 rounded-lg border border-border/50">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200",
            active === tab.key
              ? "text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground/80",
          )}
        >
          {active === tab.key && (
            <motion.div
              layoutId="filter-bg"
              className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-md border border-border/50"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
              active === tab.key
                ? "bg-primary/10 text-primary"
                : "bg-muted-foreground/10 text-muted-foreground",
            )}>
              {tab.count}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
