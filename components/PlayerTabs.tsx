"use client";

import { Player } from "@/lib/types";

interface PlayerTabsProps {
  players: Player[];
  currentPlayerIndex: number;
}

export default function PlayerTabs({
  players,
  currentPlayerIndex,
}: PlayerTabsProps) {
  if (players.length <= 1) {
    return (
      <div className="text-center py-2">
        <span className="text-lg font-semibold">{players[0]?.name}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 py-2">
      {players.map((p, i) => (
        <div
          key={p.id}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${
            i === currentPlayerIndex
              ? "bg-indigo-600 text-white shadow"
              : "bg-white text-slate-500 border border-slate-200"
          }`}
        >
          {p.name}
        </div>
      ))}
    </div>
  );
}
