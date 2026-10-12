import { useRef, useEffect } from "react";

type SwipeOpts = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  thresholdPx?: number;
  maxAngleDeg?: number;
};

export function useSwipe<T extends HTMLElement>({
  onSwipeLeft,
  onSwipeRight,
  thresholdPx = 60,
  maxAngleDeg = 30,
}: SwipeOpts) {
  const ref = useRef<T | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const onPointerDown = (e: PointerEvent) => {
      if (e.isPrimary === false) return;
      // Capturing an answer button's pointer retargets its click to the deck.
      // Keep native button/link/input interaction intact; swipe on the card surface.
      if (e.target instanceof Element && e.target.closest('button, a, input, textarea, select, [role="button"]')) {
        start.current = null;
        moved.current = false;
        return;
      }
      start.current = { x: e.clientX, y: e.clientY };
      moved.current = false;
      el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = () => {
      if (!start.current) return;
      moved.current = true;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      const dist = Math.hypot(dx, dy);
      const angle = toDeg(Math.atan2(Math.abs(dy), Math.abs(dx))); // 0° = horizontal
      const isHorizontalEnough = angle <= maxAngleDeg;

      if (moved.current && dist >= thresholdPx && isHorizontalEnough) {
        if (dx < 0 && onSwipeLeft) onSwipeLeft();
        else if (dx > 0 && onSwipeRight) onSwipeRight();
      }
      start.current = null;
      moved.current = false;
      el.releasePointerCapture?.(e.pointerId);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, [onSwipeLeft, onSwipeRight, thresholdPx, maxAngleDeg]);

  return ref;
}


