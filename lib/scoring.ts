import { Category, DiceValue, UPPER_CATEGORIES } from "./types";
import { ScoringSettings } from "./scoringSettings";

function counts(dice: DiceValue[]): number[] {
  const c = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dice) c[d]++;
  return c;
}

function sum(dice: DiceValue[]): number {
  return dice.reduce((a, b) => a + b, 0);
}

function sumOfValue(dice: DiceValue[], value: number): number {
  return dice.filter((d) => d === value).length * value;
}

function hasNOfAKind(dice: DiceValue[], n: number): boolean {
  return counts(dice).some((c) => c >= n);
}

function isFullHouse(dice: DiceValue[]): boolean {
  const c = counts(dice).filter((n) => n > 0);
  return (
    (c.length === 2 && c.includes(2) && c.includes(3)) ||
    (c.length === 1 && c[0] === 5)
  );
}

function hasStraight(dice: DiceValue[], length: number): boolean {
  const unique = Array.from(new Set(dice)).sort((a, b) => a - b);
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    if (unique[i] === unique[i - 1] + 1) {
      run++;
      if (run >= length) return true;
    } else {
      run = 1;
    }
  }
  return unique.length > 0 && run >= length;
}

function isYahtzee(dice: DiceValue[]): boolean {
  return dice.length === 5 && counts(dice).some((c) => c === 5);
}

export function calculateScore(
  category: Category,
  dice: DiceValue[],
  settings: ScoringSettings
): number {
  switch (category) {
    case "ones":
      return sumOfValue(dice, 1);
    case "twos":
      return sumOfValue(dice, 2);
    case "threes":
      return sumOfValue(dice, 3);
    case "fours":
      return sumOfValue(dice, 4);
    case "fives":
      return sumOfValue(dice, 5);
    case "sixes":
      return sumOfValue(dice, 6);
    case "threeOfAKind":
      return hasNOfAKind(dice, 3) ? sum(dice) : 0;
    case "fourOfAKind":
      return hasNOfAKind(dice, 4) ? sum(dice) : 0;
    case "fullHouse":
      return isFullHouse(dice) ? settings.fullHouseValue : 0;
    case "smallStraight":
      return hasStraight(dice, 4) ? settings.smallStraightValue : 0;
    case "largeStraight":
      return hasStraight(dice, 5) ? settings.largeStraightValue : 0;
    case "yahtzee":
      return isYahtzee(dice) ? settings.yahtzeeValue : 0;
    case "chance":
      return sum(dice);
    default:
      return 0;
  }
}

export function upperSectionSum(
  scores: Partial<Record<Category, number>>
): number {
  return UPPER_CATEGORIES.reduce((acc, cat) => acc + (scores[cat] ?? 0), 0);
}

export function upperBonus(
  scores: Partial<Record<Category, number>>,
  settings: ScoringSettings
): number {
  return upperSectionSum(scores) >= settings.upperBonusThreshold
    ? settings.upperBonusValue
    : 0;
}

export function lowerSectionSum(
  scores: Partial<Record<Category, number>>
): number {
  const lowerCats: Category[] = [
    "threeOfAKind",
    "fourOfAKind",
    "fullHouse",
    "smallStraight",
    "largeStraight",
    "yahtzee",
    "chance",
  ];
  return lowerCats.reduce((acc, cat) => acc + (scores[cat] ?? 0), 0);
}

export function totalScore(
  scores: Partial<Record<Category, number>>,
  settings: ScoringSettings
): number {
  return (
    upperSectionSum(scores) +
    upperBonus(scores, settings) +
    lowerSectionSum(scores)
  );
}
