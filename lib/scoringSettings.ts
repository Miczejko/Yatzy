export interface ScoringSettings {
  upperBonusThreshold: number;
  upperBonusValue: number;
  fullHouseValue: number;
  smallStraightValue: number;
  largeStraightValue: number;
  yahtzeeValue: number;
}

export const DEFAULT_SCORING_SETTINGS: ScoringSettings = {
  upperBonusThreshold: 63,
  upperBonusValue: 35,
  fullHouseValue: 25,
  smallStraightValue: 30,
  largeStraightValue: 40,
  yahtzeeValue: 50,
};

const SCORING_SETTINGS_KEY = "yatzy:scoringSettings";

export function loadScoringSettings(): ScoringSettings {
  if (typeof window === "undefined") return DEFAULT_SCORING_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SCORING_SETTINGS_KEY);
    if (!raw) return DEFAULT_SCORING_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SCORING_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SCORING_SETTINGS;
  }
}

export function saveScoringSettings(settings: ScoringSettings): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SCORING_SETTINGS_KEY, JSON.stringify(settings));
}
