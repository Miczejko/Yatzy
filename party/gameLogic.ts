// Pure, server-side game reducer. No I/O, unit-testable without Partykit.
import {
  Category,
  ClientMessage,
  DiceValue,
  MAX_PLAYERS,
  MAX_ROLLS,
  PLAYER_COLORS,
  RoomPlayer,
  RoomState,
} from "../lib/types";
import { calculateScore } from "../lib/scoring";

export interface ActionContext {
  playerId: string;
  isHost: boolean;
}

function randomDie(): DiceValue {
  return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}

function isGameOver(state: RoomState): boolean {
  return (
    state.players.length > 0 &&
    state.players.every((p) => Object.keys(p.scores).length === 13)
  );
}

function nextTurn(state: RoomState): Partial<RoomState> {
  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  const wrapped = nextIndex === 0;
  return {
    currentPlayerIndex: nextIndex,
    round: wrapped ? state.round + 1 : state.round,
    dice: [1, 1, 1, 1, 1],
    held: [false, false, false, false, false],
    rollsUsed: 0,
    hasRolledThisTurn: false,
  };
}

export function addPlayer(
  state: RoomState,
  playerId: string,
  name: string
): { state: RoomState; error?: string } {
  const existing = state.players.find((p) => p.id === playerId);
  if (existing) {
    existing.connectionStatus = "connected";
    return { state: { ...state, players: [...state.players] } };
  }

  if (state.phase !== "lobby") {
    // Reconnect-only during an active game; unknown players can't join mid-game.
    return { state, error: "Gra już się rozpoczęła, nie można dołączyć." };
  }

  if (state.players.length >= MAX_PLAYERS) {
    return { state, error: "Pokój pełny." };
  }

  const color = PLAYER_COLORS[state.players.length % PLAYER_COLORS.length];
  const isHost = state.players.length === 0;
  const player: RoomPlayer = {
    id: playerId,
    name: name.trim() || `Gracz ${state.players.length + 1}`,
    color,
    isHost,
    connectionStatus: "connected",
    scores: {},
  };

  return {
    state: {
      ...state,
      players: [...state.players, player],
      hostId: isHost ? playerId : state.hostId,
    },
  };
}

export function markDisconnected(state: RoomState, playerId: string): RoomState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, connectionStatus: "disconnected" } : p
    ),
  };
}

export function markConnected(state: RoomState, playerId: string): RoomState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, connectionStatus: "connected" } : p
    ),
  };
}

export function removePlayer(state: RoomState, playerId: string): RoomState {
  const players = state.players.filter((p) => p.id !== playerId);
  let hostId = state.hostId;
  if (hostId === playerId) {
    hostId = players[0]?.id ?? null;
    players.forEach((p, i) => (p.isHost = i === 0));
  }
  return { ...state, players, hostId };
}

export function kickPlayer(
  state: RoomState,
  ctx: ActionContext,
  targetId: string
): { state: RoomState; error?: string } {
  if (!ctx.isHost) return { state, error: "Tylko host może usuwać graczy." };
  if (state.phase !== "lobby")
    return { state, error: "Graczy można usuwać tylko w poczekalni." };
  if (targetId === ctx.playerId)
    return { state, error: "Nie możesz wyrzucić samego siebie." };
  if (!state.players.some((p) => p.id === targetId))
    return { state, error: "Nie znaleziono gracza w pokoju." };
  return { state: removePlayer(state, targetId) };
}

export function applyAction(
  state: RoomState,
  action: ClientMessage,
  ctx: ActionContext
): { state: RoomState; error?: string } {
  switch (action.type) {
    case "START_GAME": {
      if (!ctx.isHost) return { state, error: "Tylko host może rozpocząć grę." };
      if (state.phase !== "lobby") return { state, error: "Gra już trwa." };
      if (state.players.length < 1)
        return { state, error: "Potrzeba co najmniej 1 gracza." };
      return {
        state: {
          ...state,
          phase: "playing",
          currentPlayerIndex: 0,
          dice: [1, 1, 1, 1, 1],
          held: [false, false, false, false, false],
          rollsUsed: 0,
          round: 1,
          hasRolledThisTurn: false,
          players: state.players.map((p) => ({ ...p, scores: {} })),
        },
      };
    }

    case "ROLL_DICE": {
      if (state.phase !== "playing") return { state, error: "Gra nie trwa." };
      const player = state.players[state.currentPlayerIndex];
      if (!player || player.id !== ctx.playerId)
        return { state, error: "To nie twoja tura." };
      if (state.throwMode !== "virtual")
        return { state, error: "Ten pokój używa trybu fizycznego." };
      if (state.rollsUsed >= MAX_ROLLS)
        return { state, error: "Wykorzystano wszystkie rzuty." };
      const dice = state.dice.map((d, i) =>
        state.held[i] ? d : randomDie()
      ) as DiceValue[];
      return {
        state: {
          ...state,
          dice,
          rollsUsed: state.rollsUsed + 1,
          hasRolledThisTurn: true,
        },
      };
    }

    case "TOGGLE_HOLD": {
      if (state.phase !== "playing") return { state, error: "Gra nie trwa." };
      const player = state.players[state.currentPlayerIndex];
      if (!player || player.id !== ctx.playerId)
        return { state, error: "To nie twoja tura." };
      if (state.rollsUsed === 0 || state.rollsUsed >= MAX_ROLLS)
        return { state, error: "Nie można teraz zatrzymać kości." };
      const held = [...state.held];
      held[action.index] = !held[action.index];
      return { state: { ...state, held } };
    }

    case "SUBMIT_MANUAL_DICE": {
      if (state.phase !== "playing") return { state, error: "Gra nie trwa." };
      const player = state.players[state.currentPlayerIndex];
      if (!player || player.id !== ctx.playerId)
        return { state, error: "To nie twoja tura." };
      if (state.throwMode !== "physical")
        return { state, error: "Ten pokój używa trybu wirtualnego." };
      if (!Array.isArray(action.dice) || action.dice.length !== 5)
        return { state, error: "Nieprawidłowe kości." };
      return {
        state: {
          ...state,
          dice: action.dice,
          rollsUsed: MAX_ROLLS,
          hasRolledThisTurn: true,
        },
      };
    }

    case "SELECT_CATEGORY": {
      if (state.phase !== "playing") return { state, error: "Gra nie trwa." };
      const idx = state.currentPlayerIndex;
      const player = state.players[idx];
      if (!player || player.id !== ctx.playerId)
        return { state, error: "To nie twoja tura." };
      if (player.scores[action.category as Category] !== undefined)
        return { state, error: "Kategoria już wypełniona." };
      if (!state.hasRolledThisTurn)
        return { state, error: "Musisz najpierw rzucić kośćmi." };

      const score = calculateScore(action.category, state.dice, state.settings);
      const players = state.players.map((p, i) =>
        i === idx
          ? { ...p, scores: { ...p.scores, [action.category]: score } }
          : p
      );
      const updated: RoomState = { ...state, players };
      if (isGameOver(updated)) {
        return { state: { ...updated, phase: "finished" } };
      }
      return { state: { ...updated, ...nextTurn(updated) } };
    }

    case "RENAME": {
      if (state.phase !== "lobby")
        return { state, error: "Nazwę można zmienić tylko w poczekalni." };
      const player = state.players.find((p) => p.id === ctx.playerId);
      if (!player) return { state, error: "Nie znaleziono gracza w pokoju." };
      const name = action.name.trim();
      if (!name) return { state, error: "Nazwa nie może być pusta." };
      return {
        state: {
          ...state,
          players: state.players.map((p) =>
            p.id === ctx.playerId ? { ...p, name: name.slice(0, 20) } : p
          ),
        },
      };
    }

    case "END_GAME_REQUEST": {
      if (!ctx.isHost) return { state, error: "Tylko host może zakończyć grę." };
      return {
        state: {
          ...state,
          phase: "lobby",
          currentPlayerIndex: 0,
          dice: [1, 1, 1, 1, 1],
          held: [false, false, false, false, false],
          rollsUsed: 0,
          round: 1,
          hasRolledThisTurn: false,
          players: state.players.map((p) => ({ ...p, scores: {} })),
        },
      };
    }

    default:
      return { state };
  }
}
