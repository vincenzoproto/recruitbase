import { useRef, useState } from "react";
import { hapticFeedback } from "@/lib/haptics";
import { cn } from "@/lib/utils";

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  leftAction?: { label: string; color: string; icon?: React.ReactNode };
  rightAction?: { label: string; color: string; icon?: React.ReactNode };
  upAction?: { label: string; color: string; icon?: React.ReactNode };
  threshold?: number;
  className?: string;
}

export const SwipeCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  leftAction,
  rightAction,
  upAction,
  threshold = 100,
  className,
}: SwipeCardProps) => {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;
    setCurrentX(deltaX);
    setCurrentY(deltaY);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    
    const deltaX = currentX;
    const deltaY = currentY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine primary direction
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (absDeltaX > threshold) {
        hapticFeedback.medium();
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (absDeltaY > threshold && deltaY < 0 && onSwipeUp) {
        hapticFeedback.medium();
        onSwipeUp();
      }
    }

    // Reset
    setIsSwiping(false);
    setCurrentX(0);
    setCurrentY(0);
  };

  const getTransform = () => {
    if (!isSwiping) return "translate(0, 0) rotate(0deg)";
    const rotation = currentX / 20; // Subtle rotation effect
    return `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
  };

  const getOpacity = () => {
    if (!isSwiping) return 1;
    const absX = Math.abs(currentX);
    const absY = Math.abs(currentY);
    const maxDelta = Math.max(absX, absY);
    return Math.max(0.3, 1 - maxDelta / 300);
  };

  const showLeftAction = isSwiping && currentX < -threshold / 2 && leftAction;
  const showRightAction = isSwiping && currentX > threshold / 2 && rightAction;
  const showUpAction = isSwiping && currentY < -threshold / 2 && upAction;

  return (
    <div className="relative">
      {/* Background action indicators */}
      {showLeftAction && (
        <div
          className="absolute inset-0 flex items-center justify-end pr-4 rounded-lg animate-fade-in"
          style={{ backgroundColor: leftAction.color }}
        >
          <div className="flex items-center gap-2 text-white font-semibold">
            {leftAction.icon}
            <span>{leftAction.label}</span>
          </div>
        </div>
      )}
      {showRightAction && (
        <div
          className="absolute inset-0 flex items-center justify-start pl-4 rounded-lg animate-fade-in"
          style={{ backgroundColor: rightAction.color }}
        >
          <div className="flex items-center gap-2 text-white font-semibold">
            {rightAction.icon}
            <span>{rightAction.label}</span>
          </div>
        </div>
      )}
      {showUpAction && (
        <div
          className="absolute inset-0 flex items-end justify-center pb-4 rounded-lg animate-fade-in"
          style={{ backgroundColor: upAction.color }}
        >
          <div className="flex items-center gap-2 text-white font-semibold">
            {upAction.icon}
            <span>{upAction.label}</span>
          </div>
        </div>
      )}

      {/* Swipeable card */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "touch-pan-y smooth-transition cursor-grab active:cursor-grabbing",
          className
        )}
        style={{
          transform: getTransform(),
          opacity: getOpacity(),
          transition: isSwiping ? "none" : "transform 0.3s ease, opacity 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
};
