"use client";

import { useCallback, useState } from "react";
import { RoomState, ServerMessage } from "@/lib/types";

export function useRoomState() {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomMissing, setRoomMissing] = useState(false);
  const [kicked, setKicked] = useState(false);

  const handleServerMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case "ROOM_STATE_UPDATE":
        setRoomState(msg.state);
        setError(null);
        break;
      case "ERROR":
        setError(msg.message);
        if (msg.code === "ROOM_NOT_FOUND") setRoomMissing(true);
        break;
      case "KICKED":
        setKicked(true);
        break;
      case "PLAYER_DISCONNECTED":
      case "PLAYER_RECONNECTED":
        // RoomState update already carries the up-to-date connectionStatus.
        break;
      default:
        break;
    }
  }, []);

  return { roomState, error, roomMissing, kicked, handleServerMessage, setError };
}
