// Local-only preferences, plus local offline-game state (pass-and-play, no server).
// Active *online* room state lives server-side in Partykit and is never persisted here.
import { GameState, ThrowMode } from "./types";

const PREFS_KEY = "yatzy:prefs";

export interface LocalPrefs {
  nickname: string;
  throwMode: ThrowMode;
}

const DEFAULT_PREFS: LocalPrefs = {
  nickname: "",
  throwMode: "virtual",
};

export function loadPrefs(): LocalPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Partial<LocalPrefs>): void {
  if (typeof window === "undefined") return;
  const current = loadPrefs();
  window.localStorage.setItem(
    PREFS_KEY,
    JSON.stringify({ ...current, ...prefs })
  );
}

// --- Per-room playerId, kept in sessionStorage so it survives refresh
// but doesn't leak between different rooms/tabs.

export function getPlayerId(roomId: string): string {
  if (typeof window === "undefined") return "";
  const key = `yatzy:playerId:${roomId}`;
  let id = window.sessionStorage.getItem(key);
  if (!id) {
    id = `pl_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.sessionStorage.setItem(key, id);
  }
  return id;
}

// --- Offline (pass-and-play) game state, kept purely on this device.

const GAME_STATE_KEY = "yatzy:offlineGameState";

export function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
}

export function clearGameState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GAME_STATE_KEY);
}
