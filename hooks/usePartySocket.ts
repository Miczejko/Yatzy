"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PartySocket from "partysocket";
import { Category, ClientMessage, DiceValue, ServerMessage, ThrowMode } from "@/lib/types";
import { ScoringSettings } from "@/lib/scoringSettings";

export type WsStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

const PARTYKIT_HOST =
  process.env.NEXT_PUBLIC_PARTYKIT_HOST || "127.0.0.1:8787";
// Kebab-case of the `YatzyRoom` Durable Object binding name (party/wrangler.jsonc).
const PARTY = "yatzy-room";

interface UsePartySocketOptions {
  roomId: string;
  playerId: string;
  nickname: string;
  throwMode?: ThrowMode;
  settings?: ScoringSettings;
  onServerMessage: (msg: ServerMessage) => void;
}

export function usePartySocket({
  roomId,
  playerId,
  nickname,
  throwMode,
  settings,
  onServerMessage,
}: UsePartySocketOptions) {
  const [status, setStatus] = useState<WsStatus>("connecting");
  const socketRef = useRef<PartySocket | null>(null);
  const onMessageRef = useRef(onServerMessage);

  useEffect(() => {
    onMessageRef.current = onServerMessage;
  }, [onServerMessage]);

  useEffect(() => {
    if (!roomId || !playerId) return;

    const socket = new PartySocket({
      host: PARTYKIT_HOST,
      party: PARTY,
      room: roomId,
    });
    socketRef.current = socket;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- connection lifecycle, not derived render state
    setStatus("connecting");

    socket.addEventListener("open", () => {
      setStatus("connected");
      const join: ClientMessage = {
        type: "JOIN_ROOM",
        playerId,
        name: nickname,
        throwMode,
        settings,
      };
      socket.send(JSON.stringify(join));
    });

    socket.addEventListener("message", (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as ServerMessage;
        onMessageRef.current(msg);
      } catch {
        // ignore malformed messages
      }
    });

    socket.addEventListener("close", () => {
      setStatus((prev) => (prev === "connecting" ? "disconnected" : "reconnecting"));
    });

    socket.addEventListener("error", () => {
      setStatus("reconnecting");
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, playerId]);

  const send = useCallback((msg: ClientMessage) => {
    socketRef.current?.send(JSON.stringify(msg));
  }, []);

  const actions = {
    startGame: useCallback(() => send({ type: "START_GAME" }), [send]),
    rollDice: useCallback(() => send({ type: "ROLL_DICE" }), [send]),
    toggleHold: useCallback(
      (index: number) => send({ type: "TOGGLE_HOLD", index }),
      [send]
    ),
    submitManualDice: useCallback(
      (dice: DiceValue[]) => send({ type: "SUBMIT_MANUAL_DICE", dice }),
      [send]
    ),
    selectCategory: useCallback(
      (category: Category) => send({ type: "SELECT_CATEGORY", category }),
      [send]
    ),
    endGameRequest: useCallback(() => send({ type: "END_GAME_REQUEST" }), [send]),
    leaveRoom: useCallback(() => send({ type: "LEAVE_ROOM" }), [send]),
    rename: useCallback((name: string) => send({ type: "RENAME", name }), [send]),
    kickPlayer: useCallback(
      (playerId: string) => send({ type: "KICK_PLAYER", playerId }),
      [send]
    ),
  };

  return { status, send, ...actions };
}
