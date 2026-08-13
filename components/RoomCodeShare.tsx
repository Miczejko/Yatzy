"use client";

import { useState } from "react";

interface RoomCodeShareProps {
  roomId: string;
}

export default function RoomCodeShare({ roomId }: RoomCodeShareProps) {
  const [copied, setCopied] = useState(false);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/?id=${roomId}`
      : `/room/?id=${roomId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — user can select the text manually
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto">
      <div className="text-4xl font-black tracking-[0.3em] bg-slate-100 rounded-2xl px-6 py-3">
        {roomId}
      </div>
      <button
        type="button"
        onClick={copy}
        className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow active:scale-95 transition"
      >
        {copied ? "Skopiowano!" : "Kopiuj link do pokoju"}
      </button>
      <p className="text-xs text-slate-500 break-all text-center">{link}</p>
      <p className="text-xs text-slate-400 text-center">
        (Kod QR nie jest jeszcze dostępny — użyj linku lub kodu powyżej.)
      </p>
    </div>
  );
}
