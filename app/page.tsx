"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import SetupForm from "@/components/SetupForm";
import { ThrowMode } from "@/lib/types";
import { createInitialState } from "@/hooks/useYahtzeeGame";
import { saveGameState } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();

  const handleStart = (playerNames: string[], throwMode: ThrowMode) => {
    const state = createInitialState(playerNames, throwMode);
    saveGameState(state);
    router.push("/game");
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">🎲 Yatzy</h1>
        <p className="text-slate-500 mt-1">Pass and play, do 4 graczy</p>
      </div>

      <SetupForm onStart={handleStart} />

      <Link
        href="/settings"
        className="text-sm font-semibold text-indigo-600 underline"
      >
        Ustawienia punktacji
      </Link>
    </main>
  );
}
