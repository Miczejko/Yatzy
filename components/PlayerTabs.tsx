"use client";

import { RoomPlayer } from "@/lib/types";

interface PlayerTabsProps {
  players: RoomPlayer[];
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
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition ${
            i === currentPlayerIndex
              ? "bg-indigo-600 text-white shadow"
              : "bg-white text-slate-500 border border-slate-200"
          }`}
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          {p.name}
          {p.connectionStatus === "disconnected" && (
            <span className="text-xs opacity-70">(rozłączony)</span>
          )}
        </div>
      ))}
    </div>
  );
}
