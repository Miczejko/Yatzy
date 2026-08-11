"use client";

import { useState } from "react";
import DiceScrollPicker from "./DiceScrollPicker";
import { DiceValue } from "@/lib/types";

interface ManualDiceInputProps {
  initialDice?: DiceValue[];
  onSubmit: (dice: DiceValue[]) => void;
}

export default function ManualDiceInput({
  initialDice,
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
      <div className="flex justify-center gap-2 sm:gap-3">
        {dice.map((d, i) => (
          <DiceScrollPicker key={i} value={d} onChange={(v) => setDie(i, v)} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onSubmit(dice)}
        className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-lg font-semibold shadow active:scale-95 transition"
      >
        Zatwierdź wynik
      </button>
    </div>
  );
}
