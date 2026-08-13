"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { normalizeRoomCode } from "@/lib/roomCode";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleJoin = () => {
    const normalized = normalizeRoomCode(code);
    if (!normalized) return;
    router.push(`/room/?id=${normalized}`);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">🎲 Yatzy</h1>
        <p className="text-slate-500 mt-1">Graj online z do 4 znajomymi</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link
          href="/create"
          className="px-6 py-4 rounded-2xl bg-indigo-600 text-white text-lg font-bold shadow active:scale-95 transition text-center"
        >
          Stwórz grę
        </Link>

        <Link
          href="/offline"
          className="px-6 py-4 rounded-2xl bg-white border-2 border-slate-300 text-slate-700 text-lg font-bold shadow active:scale-95 transition text-center"
        >
          Graj offline
        </Link>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-600 px-1">
            Dołącz do gry
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Kod pokoju"
              maxLength={8}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 text-lg uppercase tracking-widest"
            />
            <button
              type="button"
              onClick={handleJoin}
              disabled={!code.trim()}
              className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold shadow active:scale-95 transition disabled:opacity-40"
            >
              Dołącz
            </button>
          </div>
        </div>
      </div>

      <Link
        href="/settings"
        className="text-sm font-semibold text-indigo-600 underline"
      >
        Ustawienia punktacji
      </Link>
    </main>
  );
}
