import { ScoringSettings } from "./scoringSettings";

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

export type ThrowMode = "virtual" | "physical";

export const CATEGORIES = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  "threeOfAKind",
  "fourOfAKind",
  "fullHouse",
  "smallStraight",
  "largeStraight",
  "yahtzee",
  "chance",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const UPPER_CATEGORIES: Category[] = [
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
];

export const LOWER_CATEGORIES: Category[] = [
  "threeOfAKind",
  "fourOfAKind",
  "fullHouse",
  "smallStraight",
  "largeStraight",
  "yahtzee",
  "chance",
];

export interface GameState {
  players: RoomPlayer[];
  currentPlayerIndex: number;
  throwMode: ThrowMode;
  dice: DiceValue[];
  held: boolean[];
  rollsUsed: number;
  round: number;
  gameOver: boolean;
  hasRolledThisTurn: boolean;
}

// --- Multiplayer / Partykit types ---

export type ConnectionStatus = "connected" | "disconnected";

export const PLAYER_COLORS = [
  "#6366f1", // indigo
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
] as const;

export interface RoomPlayer {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  connectionStatus: ConnectionStatus;
  scores: Partial<Record<Category, number>>;
}

export type RoomPhase = "lobby" | "playing" | "finished";

export interface RoomState {
  roomId: string;
  phase: RoomPhase;
  players: RoomPlayer[];
  hostId: string | null;
  throwMode: ThrowMode;
  settings: ScoringSettings;
  currentPlayerIndex: number;
  dice: DiceValue[];
  held: boolean[];
  rollsUsed: number;
  round: number;
  hasRolledThisTurn: boolean;
  maxPlayers: number;
}

// --- WebSocket messages ---

export type ClientMessage =
  | {
      type: "JOIN_ROOM";
      playerId: string;
      name: string;
      throwMode?: ThrowMode;
      settings?: ScoringSettings;
    }
  | { type: "START_GAME" }
  | { type: "ROLL_DICE" }
  | { type: "TOGGLE_HOLD"; index: number }
  | { type: "SUBMIT_MANUAL_DICE"; dice: DiceValue[] }
  | { type: "SELECT_CATEGORY"; category: Category }
  | { type: "END_GAME_REQUEST" }
  | { type: "LEAVE_ROOM" }
  | { type: "RENAME"; name: string }
  | { type: "KICK_PLAYER"; playerId: string };

export type ServerMessage =
  | { type: "ROOM_STATE_UPDATE"; state: RoomState }
  | { type: "ERROR"; message: string; code?: string }
  | { type: "PLAYER_DISCONNECTED"; playerId: string }
  | { type: "PLAYER_RECONNECTED"; playerId: string }
  | { type: "KICKED" };

export const MAX_ROLLS = 3;
export const MAX_PLAYERS = 4;
