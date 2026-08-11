"use client";

import { Category } from "@/lib/types";

interface ScoreRowProps {
  label: string;
  category: Category;
  currentValue: number | null;
  savedValue: number | undefined;
  canSelect: boolean;
  onSelect: (category: Category, value: number) => void;
}

export default function ScoreRow({
  label,
  category,
  currentValue,
  savedValue,
  canSelect,
  onSelect,
}: ScoreRowProps) {
  const isFilled = savedValue !== undefined;

  return (
    <button
      type="button"
      disabled={isFilled || !canSelect}
      onClick={() => currentValue !== null && onSelect(category, currentValue)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition ${
        isFilled
          ? "bg-slate-200 border-slate-200 text-slate-500"
          : canSelect
          ? "bg-white border-slate-300 hover:bg-indigo-50 active:scale-[0.99]"
          : "bg-white border-slate-200 text-slate-400"
      }`}
    >
      <span className="font-medium">{label}</span>
      <span
        className={`text-lg font-bold ${
          isFilled
            ? "text-slate-500"
            : canSelect
            ? "text-indigo-600"
            : "text-slate-300"
        }`}
      >
        {isFilled ? savedValue : canSelect && currentValue !== null ? currentValue : "–"}
      </span>
    </button>
  );
}
