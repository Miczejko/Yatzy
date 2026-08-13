"use client";

import { useState } from "react";

interface GameControlsProps {
  round: number;
  totalRounds: number;
  isHost: boolean;
  onEndGame: () => void;
}

export default function GameControls({
  round,
  totalRounds,
  isHost,
  onEndGame,
}: GameControlsProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-2">
      <span className="text-sm text-slate-500">
        Runda {round}/{totalRounds}
      </span>
      {isHost && (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-sm font-semibold text-red-600 px-3 py-2 rounded-lg hover:bg-red-50"
        >
          Zakończ grę
        </button>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl flex flex-col gap-4">
            <h2 className="text-lg font-bold">Na pewno zakończyć grę?</h2>
            <p className="text-sm text-slate-600">
              Gra zostanie zakończona dla wszystkich graczy i pokój wróci do
              poczekalni.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 font-semibold"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  onEndGame();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold"
              >
                Zakończ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
