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

export interface Player {
  id: string;
  name: string;
  scores: Partial<Record<Category, number>>;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  throwMode: ThrowMode;
  dice: DiceValue[];
  held: boolean[];
  rollsUsed: number;
  round: number;
  gameOver: boolean;
  hasRolledThisTurn: boolean;
}
