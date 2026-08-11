"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_SCORING_SETTINGS,
  ScoringSettings,
  loadScoringSettings,
  saveScoringSettings,
} from "@/lib/scoringSettings";

const FIELDS: { key: keyof ScoringSettings; label: string }[] = [
  { key: "upperBonusThreshold", label: "Próg bonusu górnej sekcji" },
  { key: "upperBonusValue", label: "Wartość bonusu górnej sekcji" },
  { key: "fullHouseValue", label: "Full house" },
  { key: "smallStraightValue", label: "Mały strit" },
  { key: "largeStraightValue", label: "Duży strit" },
  { key: "yahtzeeValue", label: "Yahtzee" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<ScoringSettings | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only localStorage hydration
    setSettings(loadScoringSettings());
  }, []);

  useEffect(() => {
    if (settings) saveScoringSettings(settings);
  }, [settings]);

  const setField = (key: keyof ScoringSettings, value: number) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const resetDefaults = () => setSettings(DEFAULT_SCORING_SETTINGS);

  if (!settings) return null;

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 gap-6">
      <h1 className="text-2xl font-bold">Ustawienia punktacji</h1>

      <div className="flex flex-col gap-3 w-full max-w-md">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-slate-700 flex-1">
              {label}
            </label>
            <input
              type="number"
              value={settings[key]}
              onChange={(e) => setField(key, Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-lg border-2 border-slate-300 text-right"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={resetDefaults}
        className="text-sm font-semibold text-slate-500 underline"
      >
        Przywróć domyślne
      </button>

      <Link
        href="/"
        className="mt-4 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow"
      >
        Wróć do menu
      </Link>
    </main>
  );
}
