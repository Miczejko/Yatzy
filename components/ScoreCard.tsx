"use client";

import { Category, DiceValue, Player, UPPER_CATEGORIES, LOWER_CATEGORIES } from "@/lib/types";
import { calculateScore, upperSectionSum, upperBonus } from "@/lib/scoring";
import { ScoringSettings } from "@/lib/scoringSettings";
import ScoreRow from "./ScoreRow";

const LABELS: Record<Category, string> = {
  ones: "Jedynki",
  twos: "Dwójki",
  threes: "Trójki",
  fours: "Czwórki",
  fives: "Piątki",
  sixes: "Szóstki",
  threeOfAKind: "Trójka",
  fourOfAKind: "Czwórka",
  fullHouse: "Full house",
  smallStraight: "Mały strit",
  largeStraight: "Duży strit",
  yahtzee: "Yahtzee",
  chance: "Szansa",
};

interface ScoreCardProps {
  player: Player;
  dice: DiceValue[];
  canSelect: boolean;
  settings: ScoringSettings;
  onSelect: (category: Category, value: number) => void;
}

export default function ScoreCard({
  player,
  dice,
  canSelect,
  settings,
  onSelect,
}: ScoreCardProps) {
  const upperSum = upperSectionSum(player.scores);
  const bonus = upperBonus(player.scores, settings);

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2 px-1">
          Górna sekcja
        </h3>
        <div className="flex flex-col gap-2">
          {UPPER_CATEGORIES.map((cat) => (
            <ScoreRow
              key={cat}
              label={LABELS[cat]}
              category={cat}
              currentValue={calculateScore(cat, dice, settings)}
              savedValue={player.scores[cat]}
              canSelect={canSelect}
              onSelect={onSelect}
            />
          ))}
        </div>
        <div className="flex justify-between px-4 py-2 text-sm text-slate-600">
          <span>
            Suma: {upperSum} / {settings.upperBonusThreshold}
          </span>
          <span>Bonus: {bonus > 0 ? `+${bonus}` : "0"}</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2 px-1">
          Dolna sekcja
        </h3>
        <div className="flex flex-col gap-2">
          {LOWER_CATEGORIES.map((cat) => (
            <ScoreRow
              key={cat}
              label={LABELS[cat]}
              category={cat}
              currentValue={calculateScore(cat, dice, settings)}
              savedValue={player.scores[cat]}
              canSelect={canSelect}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export { LABELS };
