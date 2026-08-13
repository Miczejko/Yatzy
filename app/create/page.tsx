"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import SetupForm from "@/components/SetupForm";
import { ThrowMode } from "@/lib/types";
import { generateRoomCode } from "@/lib/roomCode";
import { loadPrefs, savePrefs } from "@/lib/storage";

export default function CreateRoomPage() {
  const router = useRouter();
  const prefs = loadPrefs();

  const handleStart = (nickname: string, throwMode: ThrowMode) => {
    savePrefs({ nickname, throwMode });
    const roomId = generateRoomCode();
    router.push(`/room/?id=${roomId}`);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">Stwórz pokój</h1>
        <p className="text-slate-500 mt-1">
          Ustaw swój nick i tryb rzutu, reszta dołączy po drodze
        </p>
      </div>

      <SetupForm
        initialNickname={prefs.nickname}
        initialThrowMode={prefs.throwMode}
        onStart={handleStart}
      />

      <Link href="/" className="text-sm font-semibold text-slate-500 underline">
        Wróć
      </Link>
    </main>
  );
}
