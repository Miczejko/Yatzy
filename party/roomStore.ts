import { RoomState, ThrowMode } from "../lib/types";
import { DEFAULT_SCORING_SETTINGS, ScoringSettings } from "../lib/scoringSettings";

export function createInitialRoomState(
  roomId: string,
  throwMode: ThrowMode = "virtual",
  settings: ScoringSettings = DEFAULT_SCORING_SETTINGS
): RoomState {
  return {
    roomId,
    phase: "lobby",
    players: [],
    hostId: null,
    throwMode,
    settings,
    currentPlayerIndex: 0,
    dice: [1, 1, 1, 1, 1],
    held: [false, false, false, false, false],
    rollsUsed: 0,
    round: 1,
    hasRolledThisTurn: false,
    maxPlayers: 4,
  };
}
