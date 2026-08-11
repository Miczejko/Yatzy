"use client";

import { Player, UPPER_CATEGORIES, LOWER_CATEGORIES } from "@/lib/types";
import { ScoringSettings } from "@/lib/scoringSettings";
import { upperSectionSum, upperBonus, lowerSectionSum, totalScore } from "@/lib/scoring";
import { LABELS } from "./ScoreCard";

interface GameOverModalProps {
  players: Player[];
  settings: ScoringSettings;
  onClose: () => void;
}

export default function GameOverModal({
  players,
  settings,
  onClose,
}: GameOverModalProps) {
  const results = players
    .map((p) => ({ player: p, total: totalScore(p.scores, settings) }))
    .sort((a, b) => b.total - a.total);
  const winnerTotal = results[0]?.total;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
      <div className="bg-white rounded-2xl p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center">Koniec gry! 🎲</h2>

        <div className="flex flex-col gap-2">
          {results.map(({ player, total }) => (
            <div
              key={player.id}
              className={`flex items-center justify-between px-4 py-3 rounded-xl ${
                total === winnerTotal
                  ? "bg-amber-100 border-2 border-amber-400"
                  : "bg-slate-50 border border-slate-200"
              }`}
            >
              <span className="font-semibold flex items-center gap-2">
                {total === winnerTotal && <span>👑</span>}
                {player.name}
              </span>
              <span className="text-xl font-bold">{total}</span>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left py-1 pr-2 text-slate-500 font-medium">
                  Kategoria
                </th>
                {players.map((p) => (
                  <th
                    key={p.id}
                    className="text-right py-1 px-2 text-slate-500 font-medium whitespace-nowrap"
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {UPPER_CATEGORIES.map((cat) => (
                <tr key={cat} className="border-t border-slate-100">
                  <td className="py-1 pr-2">{LABELS[cat]}</td>
                  {players.map((p) => (
                    <td key={p.id} className="text-right py-1 px-2">
                      {p.scores[cat] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-slate-200 font-semibold">
                <td className="py-1 pr-2">Suma górna</td>
                {players.map((p) => (
                  <td key={p.id} className="text-right py-1 px-2">
                    {upperSectionSum(p.scores)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1 pr-2">Bonus</td>
                {players.map((p) => (
                  <td key={p.id} className="text-right py-1 px-2">
                    {upperBonus(p.scores, settings)}
                  </td>
                ))}
              </tr>
              {LOWER_CATEGORIES.map((cat) => (
                <tr key={cat} className="border-t border-slate-100">
                  <td className="py-1 pr-2">{LABELS[cat]}</td>
                  {players.map((p) => (
                    <td key={p.id} className="text-right py-1 px-2">
                      {p.scores[cat] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-slate-200 font-semibold">
                <td className="py-1 pr-2">Suma dolna</td>
                {players.map((p) => (
                  <td key={p.id} className="text-right py-1 px-2">
                    {lowerSectionSum(p.scores)}
                  </td>
                ))}
              </tr>
              <tr className="border-t-2 border-slate-300 font-bold text-base">
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

        <button
          type="button"
          onClick={onClose}
          className="mt-2 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-semibold shadow"
        >
          Nowa gra
        </button>
      </div>
    </div>
  );
}
