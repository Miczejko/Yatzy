"use client";

import { WsStatus } from "@/hooks/usePartySocket";

const LABELS: Record<WsStatus, string> = {
  connecting: "Łączenie z pokojem...",
  connected: "Połączono",
  disconnected: "Rozłączono",
  reconnecting: "Połączenie przerwane, próbuję ponownie...",
};

const COLORS: Record<WsStatus, string> = {
  connecting: "bg-amber-100 text-amber-700",
  connected: "bg-emerald-100 text-emerald-700",
  disconnected: "bg-red-100 text-red-700",
  reconnecting: "bg-amber-100 text-amber-700",
};

export default function ConnectionStatus({ status }: { status: WsStatus }) {
  if (status === "connected") return null;
  return (
    <div
      className={`fixed top-2 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full text-sm font-medium shadow ${COLORS[status]}`}
    >
      {LABELS[status]}
    </div>
  );
}
