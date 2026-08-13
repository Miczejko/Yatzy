"use client";

import { useState } from "react";
import DiceScrollPicker from "./DiceScrollPicker";
import { DiceValue } from "@/lib/types";

interface ManualDiceInputProps {
  initialDice?: DiceValue[];
  disabled?: boolean;
  onSubmit: (dice: DiceValue[]) => void;
}

export default function ManualDiceInput({
  initialDice,
  disabled = false,
  onSubmit,
}: ManualDiceInputProps) {
  const [dice, setDice] = useState<DiceValue[]>(
    initialDice ?? [1, 1, 1, 1, 1]
  );

  const setDie = (index: number, value: DiceValue) => {
    setDice((prev) => {
      const next = [...prev] as DiceValue[];
      next[index] = value;
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-sm text-slate-600 text-center px-4">
        Rzuć 5 kośćmi realnie 3 razy, potem wpisz tutaj finalny wynik.
      </p>
      <div
        className={`flex justify-center gap-2 sm:gap-3 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        {dice.map((d, i) => (
          <DiceScrollPicker key={i} value={d} onChange={(v) => setDie(i, v)} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onSubmit(dice)}
        disabled={disabled}
        className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-lg font-semibold shadow active:scale-95 transition disabled:opacity-40"
      >
        Zatwierdź wynik
      </button>
      {disabled && (
        <p className="text-sm text-slate-500">Czekaj na swoją turę...</p>
      )}
    </div>
  );
}
