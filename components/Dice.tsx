"use client";

import { DiceValue } from "@/lib/types";

const PIP_LAYOUTS: Record<DiceValue, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [25, 25],
    [75, 75],
  ],
  3: [
    [25, 25],
    [50, 50],
    [75, 75],
  ],
  4: [
    [25, 25],
    [75, 25],
    [25, 75],
    [75, 75],
  ],
  5: [
    [25, 25],
    [75, 25],
    [50, 50],
    [25, 75],
    [75, 75],
  ],
  6: [
    [25, 25],
    [75, 25],
    [25, 50],
    [75, 50],
    [25, 75],
    [75, 75],
  ],
};

interface DiceProps {
  value: DiceValue;
  held?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: "md" | "lg";
}

export default function Dice({
  value,
  held = false,
  onClick,
  disabled = false,
  size = "lg",
}: DiceProps) {
  const dims = size === "lg" ? "w-16 h-16 sm:w-20 sm:h-20" : "w-12 h-12";
  const pipSize = size === "lg" ? "w-3 h-3 sm:w-3.5 sm:h-3.5" : "w-2 h-2";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={held}
      className={`${dims} relative rounded-xl border-2 shadow-sm transition-all active:scale-95 ${
        held
          ? "bg-amber-300 border-amber-500 shadow-inner"
          : "bg-white border-slate-300"
      } ${disabled ? "opacity-60" : ""}`}
    >
      {PIP_LAYOUTS[value].map(([x, y], i) => (
        <span
          key={i}
          className={`absolute ${pipSize} rounded-full bg-slate-800 -translate-x-1/2 -translate-y-1/2`}
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </button>
  );
}
