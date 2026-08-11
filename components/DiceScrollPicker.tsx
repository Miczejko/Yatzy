"use client";

import { useEffect, useRef } from "react";
import { DiceValue } from "@/lib/types";

const VALUES: DiceValue[] = [1, 2, 3, 4, 5, 6];
const ITEM_HEIGHT = 56;

interface DiceScrollPickerProps {
  value: DiceValue;
  onChange: (value: DiceValue) => void;
}

export default function DiceScrollPicker({
  value,
  onChange,
}: DiceScrollPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    isProgrammaticScroll.current = true;
    el.scrollTo({ top: (value - 1) * ITEM_HEIGHT, behavior: "auto" });
    const t = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || isProgrammaticScroll.current) return;
    const index = Math.round(el.scrollTop / ITEM_HEIGHT);
    const clamped = Math.min(Math.max(index, 0), 5);
    const newValue = VALUES[clamped];
    if (newValue !== value) onChange(newValue);
  };

  const handleScrollEnd = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      const el = containerRef.current;
      if (!el) return;
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.min(Math.max(index, 0), 5);
      el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: "smooth" });
      const newValue = VALUES[clamped];
      if (newValue !== value) onChange(newValue);
    }, 100);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <div
          ref={containerRef}
          onScroll={() => {
            handleScroll();
            handleScrollEnd();
          }}
          className="no-scrollbar w-14 h-[168px] overflow-y-scroll snap-y snap-mandatory rounded-xl border-2 border-slate-300 bg-white"
          style={{ scrollSnapType: "y mandatory" }}
        >
          <div style={{ height: ITEM_HEIGHT }} />
          {VALUES.map((v) => (
            <div
              key={v}
              className="snap-center flex items-center justify-center text-2xl font-bold text-slate-800"
              style={{ height: ITEM_HEIGHT }}
            >
              {v}
            </div>
          ))}
          <div style={{ height: ITEM_HEIGHT }} />
        </div>
        <div
          className="pointer-events-none absolute left-0 right-0 border-y-2 border-amber-400"
          style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
        />
      </div>
    </div>
  );
}
