import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  snapPoints?: number[];
  headerContent?: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  children,
  isOpen,
  onClose,
  snapPoints = [30, 55, 85],
  headerContent,
  className,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);

  const handleDragEnd = useCallback((_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity > 300 || offset > 80) {
      if (currentSnap === 0) {
        onClose();
      } else {
        setCurrentSnap((prev) => Math.max(0, prev - 1));
      }
    } else if (velocity < -300 || offset < -80) {
      setCurrentSnap((prev) => Math.min(snapPoints.length - 1, prev + 1));
    }

    dragY.set(0);
  }, [currentSnap, snapPoints, onClose, dragY]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentSnap(0);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={sheetRef}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 200 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ y: dragY }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-40",
            "bg-white dark:bg-neutral-900",
            "rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.3)]",
            "border-t border-border/50",
            className,
          )}
        >
          {/* Handle Bar */}
          <div className="sticky top-0 z-10 bg-white dark:bg-neutral-900 rounded-t-2xl">
            <div className="flex items-center justify-between px-4 pt-2 pb-1">
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <button
                onClick={onClose}
                className="flex-1 flex justify-end"
              >
                <div className="p-1 rounded-lg hover:bg-muted/50 transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            </div>

            {/* Header Content */}
            {headerContent && (
              <div className="px-4 pb-2">{headerContent}</div>
            )}
          </div>

          {/* Content */}
          <div
            className="overflow-y-auto px-4 pb-6"
            style={{
              maxHeight: `calc(${snapPoints[currentSnap]}vh - 60px)`,
            }}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
