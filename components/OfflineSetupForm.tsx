"use client";

import { useState } from "react";
import { ThrowMode } from "@/lib/types";

interface OfflineSetupFormProps {
  onStart: (playerNames: string[], throwMode: ThrowMode) => void;
}

export default function OfflineSetupForm({ onStart }: OfflineSetupFormProps) {
  const [numPlayers, setNumPlayers] = useState(1);
  const [names, setNames] = useState<string[]>(["", "", "", ""]);
  const [throwMode, setThrowMode] = useState<ThrowMode>("virtual");

  const setName = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleStart = () => {
    const playerNames = names
      .slice(0, numPlayers)
      .map((n, i) => n.trim() || `Gracz ${i + 1}`);
    onStart(playerNames, throwMode);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-2">
          Liczba graczy
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNumPlayers(n)}
              className={`py-3 rounded-xl font-bold text-lg border-2 transition ${
                numPlayers === n
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-slate-300 text-slate-700"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: numPlayers }, (_, i) => (
          <input
            key={i}
            type="text"
            value={names[i]}
            onChange={(e) => setName(i, e.target.value)}
            placeholder={`Gracz ${i + 1}`}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-lg"
          />
        ))}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-600 mb-2">
          Tryb rzutu
        </label>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => setThrowMode("virtual")}
            className={`px-4 py-4 rounded-xl border-2 text-left transition ${
              throwMode === "virtual"
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-slate-300"
            }`}
          >
            <div className="font-bold">Wirtualny</div>
            <div
              className={`text-sm ${
                throwMode === "virtual" ? "text-indigo-100" : "text-slate-500"
              }`}
            >
              Aplikacja losuje kości za Ciebie
            </div>
          </button>
          <button
            type="button"
            onClick={() => setThrowMode("physical")}
            className={`px-4 py-4 rounded-xl border-2 text-left transition ${
              throwMode === "physical"
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-slate-300"
            }`}
          >
            <div className="font-bold">Fizyczny</div>
            <div
              className={`text-sm ${
                throwMode === "physical" ? "text-indigo-100" : "text-slate-500"
              }`}
            >
              Rzucasz prawdziwymi kośćmi, wpisujesz wynik
            </div>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleStart}
        className="px-6 py-4 rounded-2xl bg-emerald-600 text-white text-lg font-bold shadow active:scale-95 transition"
      >
        Rozpocznij grę
      </button>
    </div>
  );
}
