import { GameState } from "./types";

const GAME_STATE_KEY = "yatzy:gameState";

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
