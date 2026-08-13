"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  Category,
  DiceValue,
  GameState,
  MAX_ROLLS,
  PLAYER_COLORS,
  RoomPlayer,
  ThrowMode,
} from "@/lib/types";
import { loadGameState, saveGameState, clearGameState } from "@/lib/storage";

function randomDie(): DiceValue {
  return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}

export function createInitialState(
  playerNames: string[],
  throwMode: ThrowMode
): GameState {
  const players: RoomPlayer[] = playerNames.map((name, i) => ({
    id: `p${i}-${Date.now()}`,
    name: name.trim() || `Gracz ${i + 1}`,
    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    isHost: i === 0,
    connectionStatus: "connected",
    scores: {},
  }));
  return {
    players,
    currentPlayerIndex: 0,
    throwMode,
    dice: [1, 1, 1, 1, 1],
    held: [false, false, false, false, false],
    rollsUsed: 0,
    round: 1,
    gameOver: false,
    hasRolledThisTurn: false,
  };
}

type Action =
  | { type: "LOAD"; state: GameState }
  | { type: "ROLL" }
  | { type: "TOGGLE_HOLD"; index: number }
  | { type: "SET_MANUAL_DICE"; dice: DiceValue[] }
  | { type: "SELECT_CATEGORY"; category: Category; score: number }
  | { type: "END_GAME" };

function nextTurn(state: GameState): Partial<GameState> {
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

function isGameOver(state: GameState): boolean {
  return state.players.every((p) => Object.keys(p.scores).length === 13);
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "LOAD":
      return action.state;

    case "ROLL": {
      if (state.rollsUsed >= MAX_ROLLS || state.gameOver) return state;
      const dice = state.dice.map((d, i) =>
        state.held[i] ? d : randomDie()
      ) as DiceValue[];
      return {
        ...state,
        dice,
        rollsUsed: state.rollsUsed + 1,
        hasRolledThisTurn: true,
      };
    }

    case "TOGGLE_HOLD": {
      if (state.rollsUsed === 0 || state.rollsUsed >= MAX_ROLLS) return state;
      const held = [...state.held];
      held[action.index] = !held[action.index];
      return { ...state, held };
    }

    case "SET_MANUAL_DICE":
      return {
        ...state,
        dice: action.dice,
        rollsUsed: MAX_ROLLS,
        hasRolledThisTurn: true,
      };

    case "SELECT_CATEGORY": {
      const player = state.players[state.currentPlayerIndex];
      if (player.scores[action.category] !== undefined) return state;
      if (!state.hasRolledThisTurn) return state;

      const players = state.players.map((p, i) =>
        i === state.currentPlayerIndex
          ? { ...p, scores: { ...p.scores, [action.category]: action.score } }
          : p
      );
      const updated = { ...state, players };
      const over = isGameOver(updated);
      if (over) {
        return { ...updated, gameOver: true };
      }
      return { ...updated, ...nextTurn(updated) };
    }

    case "END_GAME":
      return { ...state, gameOver: true };

    default:
      return state;
  }
}

export function useYahtzeeGame() {
  const [state, dispatch] = useReducer(reducer, null as unknown as GameState);
  const loadedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const saved = loadGameState();
    if (saved) {
      dispatch({ type: "LOAD", state: saved });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (state) saveGameState(state);
  }, [state]);

  const startGame = useCallback((playerNames: string[], throwMode: ThrowMode) => {
    const initial = createInitialState(playerNames, throwMode);
    dispatch({ type: "LOAD", state: initial });
  }, []);

  const roll = useCallback(() => dispatch({ type: "ROLL" }), []);

  const toggleHold = useCallback(
    (index: number) => dispatch({ type: "TOGGLE_HOLD", index }),
    []
  );

  const setManualDice = useCallback(
    (dice: DiceValue[]) => dispatch({ type: "SET_MANUAL_DICE", dice }),
    []
  );

  const selectCategory = useCallback(
    (category: Category, score: number) =>
      dispatch({ type: "SELECT_CATEGORY", category, score }),
    []
  );

  const endGame = useCallback(() => {
    clearGameState();
    dispatch({ type: "LOAD", state: null as unknown as GameState });
  }, []);

  return {
    state,
    loaded,
    startGame,
    roll,
    toggleHold,
    setManualDice,
    selectCategory,
    endGame,
    MAX_ROLLS,
  };
}
