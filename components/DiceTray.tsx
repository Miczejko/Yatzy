"use client";

import Dice from "./Dice";
import { DiceValue } from "@/lib/types";

interface DiceTrayProps {
  dice: DiceValue[];
  held: boolean[];
  rollsUsed: number;
  maxRolls: number;
  disabled?: boolean;
  onRoll: () => void;
  onToggleHold: (index: number) => void;
}

export default function DiceTray({
  dice,
  held,
  rollsUsed,
  maxRolls,
  disabled = false,
  onRoll,
  onToggleHold,
}: DiceTrayProps) {
  const rollsLeft = maxRolls - rollsUsed;
  const canRoll = rollsLeft > 0 && !disabled;
  const canHold = rollsUsed > 0 && rollsUsed < maxRolls && !disabled;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        {dice.map((value, i) => (
          <Dice
            key={i}
            value={value}
            held={held[i]}
            onClick={() => canHold && onToggleHold(i)}
            disabled={!canHold}
          />
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onRoll}
          disabled={!canRoll}
          className="px-8 py-4 rounded-2xl bg-indigo-600 text-white text-lg font-semibold shadow active:scale-95 transition disabled:opacity-40 disabled:active:scale-100"
        >
          {rollsUsed === 0 ? "Rzuć" : "Rzuć ponownie"}
        </button>
        <span className="text-sm text-slate-600">
          Rzuty: {rollsUsed}/{maxRolls}
        </span>
      </div>
      {disabled ? (
        <p className="text-sm text-slate-500">Czekaj na swoją turę...</p>
      ) : (
        !canRoll && (
          <p className="text-sm text-slate-500">
            Wykorzystano wszystkie rzuty — wybierz kategorię poniżej.
          </p>
        )
      )}
    </div>
  );
}
