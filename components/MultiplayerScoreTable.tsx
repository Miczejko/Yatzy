"use client";

import { useState } from "react";
import {
  RoomPlayer,
  UPPER_CATEGORIES,
  LOWER_CATEGORIES,
} from "@/lib/types";
import { ScoringSettings } from "@/lib/scoringSettings";
import {
  upperSectionSum,
  upperBonus,
  lowerSectionSum,
  totalScore,
} from "@/lib/scoring";
import { LABELS } from "./ScoreCard";

interface MultiplayerScoreTableProps {
  players: RoomPlayer[];
  currentPlayerIndex: number;
  settings: ScoringSettings;
}

export default function MultiplayerScoreTable({
  players,
  currentPlayerIndex,
  settings,
}: MultiplayerScoreTableProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = players[Math.min(activeIndex, players.length - 1)];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      {/* Desktop / wide: full table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left py-1 pr-2 text-slate-500 font-medium">
                Kategoria
              </th>
              {players.map((p, i) => (
                <th
                  key={p.id}
                  className={`text-right py-1 px-2 font-medium whitespace-nowrap ${
                    i === currentPlayerIndex ? "text-indigo-600" : "text-slate-500"
                  }`}
                >
                  {p.name}
                  {i === currentPlayerIndex ? " 🎲" : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...UPPER_CATEGORIES, ...LOWER_CATEGORIES].map((cat) => (
              <tr key={cat} className="border-t border-slate-100">
                <td className="py-1 pr-2">{LABELS[cat]}</td>
                {players.map((p) => (
                  <td key={p.id} className="text-right py-1 px-2">
                    {p.scores[cat] ?? "-"}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t-2 border-slate-300 font-bold">
              <td className="py-2 pr-2">Total</td>
              {players.map((p) => (
                <td key={p.id} className="text-right py-2 px-2">
                  {totalScore(p.scores, settings)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile: carousel of per-player cards */}
      <div className="sm:hidden flex flex-col gap-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {players.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                i === activeIndex
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              {p.name}
              {i === currentPlayerIndex ? " 🎲" : ""}
            </button>
          ))}
        </div>
        {active && (
          <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col gap-1">
            {[...UPPER_CATEGORIES, ...LOWER_CATEGORIES].map((cat) => (
              <div key={cat} className="flex justify-between text-sm py-0.5">
                <span className="text-slate-600">{LABELS[cat]}</span>
                <span className="font-semibold">
                  {active.scores[cat] ?? "-"}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-2 mt-1 border-t border-slate-200 font-bold">
              <span>Suma górna + bonus</span>
              <span>
                {upperSectionSum(active.scores) + upperBonus(active.scores, settings)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span>Suma dolna</span>
              <span>{lowerSectionSum(active.scores)}</span>
            </div>
            <div className="flex justify-between text-base pt-1 font-black">
              <span>Total</span>
              <span>{totalScore(active.scores, settings)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
