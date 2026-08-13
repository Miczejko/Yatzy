"use client";

import { useState } from "react";
import { RoomPlayer } from "@/lib/types";
import RoomCodeShare from "./RoomCodeShare";

interface LobbyProps {
  roomId: string;
  players: RoomPlayer[];
  maxPlayers: number;
  isHost: boolean;
  myPlayerId: string;
  onStart: () => void;
  onRename: (name: string) => void;
  onKick: (playerId: string) => void;
}

export default function Lobby({
  roomId,
  players,
  maxPlayers,
  isHost,
  myPlayerId,
  onStart,
  onRename,
  onKick,
}: LobbyProps) {
  const canStart = players.length >= 1;
  const isFull = players.length >= maxPlayers;
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [kickTarget, setKickTarget] = useState<RoomPlayer | null>(null);

  const startEditing = (current: string) => {
    setDraftName(current);
    setEditing(true);
  };

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed) onRename(trimmed);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold">Poczekalnia</h1>
        <p className="text-slate-500 text-sm mt-1">
          Udostępnij link znajomym, żeby dołączyli
        </p>
      </div>

      <RoomCodeShare roomId={roomId} />

      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2 px-1">
          Gracze ({players.length}/{maxPlayers})
        </h2>
        <div className="flex flex-col gap-2">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200"
            >
              <span
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: p.color }}
              />
              {p.id === myPlayerId && editing ? (
                <input
                  autoFocus
                  type="text"
                  value={draftName}
                  maxLength={20}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitRename();
                    if (e.key === "Escape") setEditing(false);
                  }}
                  className="font-medium flex-1 min-w-0 rounded-lg border border-indigo-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              ) : (
                <span className="font-medium flex-1 truncate">{p.name}</span>
              )}
              {p.id === myPlayerId && !editing && (
                <button
                  type="button"
                  onClick={() => startEditing(p.name)}
                  aria-label="Zmień nazwę"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Zmień
                </button>
              )}
              {p.isHost && (
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                  Host
                </span>
              )}
              {p.connectionStatus === "disconnected" && (
                <span className="text-xs font-semibold text-red-500">
                  Rozłączony
                </span>
              )}
              {isHost && p.id !== myPlayerId && (
                <button
                  type="button"
                  onClick={() => setKickTarget(p)}
                  aria-label={`Wyrzuć ${p.name}`}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  Wyrzuć
                </button>
              )}
            </div>
          ))}
          {isFull && (
            <p className="text-sm text-center text-amber-600 font-medium mt-1">
              Pokój pełny
            </p>
          )}
        </div>
      </div>

      {isHost ? (
        <button
          type="button"
          onClick={onStart}
          disabled={!canStart}
          className="px-6 py-4 rounded-2xl bg-emerald-600 text-white text-lg font-bold shadow active:scale-95 transition disabled:opacity-40"
        >
          Graj
        </button>
      ) : (
        <p className="text-center text-sm text-slate-500">
          Czekasz, aż host rozpocznie grę...
        </p>
      )}

      {kickTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl flex flex-col gap-4">
            <h2 className="text-lg font-bold">
              Wyrzucić gracza {kickTarget.name}?
            </h2>
            <p className="text-sm text-slate-600">
              Gracz zostanie usunięty z pokoju i będzie musiał dołączyć ponownie.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setKickTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-semibold"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={() => {
                  onKick(kickTarget.id);
                  setKickTarget(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold"
              >
                Wyrzuć
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
