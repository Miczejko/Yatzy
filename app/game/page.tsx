"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useYahtzeeGame } from "@/hooks/useYahtzeeGame";
import { loadScoringSettings, ScoringSettings } from "@/lib/scoringSettings";
import { Category } from "@/lib/types";
import DiceTray from "@/components/DiceTray";
import ManualDiceInput from "@/components/ManualDiceInput";
import ScoreCard from "@/components/ScoreCard";
import PlayerTabs from "@/components/PlayerTabs";
import GameControls from "@/components/GameControls";
import GameOverModal from "@/components/GameOverModal";

export default function GamePage() {
  const router = useRouter();
  const {
    state,
    loaded,
    roll,
    toggleHold,
    setManualDice,
    selectCategory,
    endGame,
    MAX_ROLLS,
  } = useYahtzeeGame();
  const [settings, setSettings] = useState<ScoringSettings | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only localStorage hydration
    setSettings(loadScoringSettings());
  }, []);

  useEffect(() => {
    if (loaded && state === null) {
      router.replace("/");
    }
  }, [loaded, state, router]);

  if (!state || !settings) return null;

  const player = state.players[state.currentPlayerIndex];
  const canSelectCategory = state.hasRolledThisTurn && !state.gameOver;

  const handleSelect = (category: Category, value: number) => {
    selectCategory(category, value);
  };

  const handleEndGame = () => {
    endGame();
  };

  const handleGameOverClose = () => {
    endGame();
    router.push("/");
  };

  return (
    <main className="flex-1 flex flex-col gap-4 px-3 py-4 max-w-2xl mx-auto w-full">
      <PlayerTabs
        players={state.players}
        currentPlayerIndex={state.currentPlayerIndex}
      />
      <GameControls
        round={state.round}
        totalRounds={13}
        isHost
        onEndGame={handleEndGame}
      />

      {state.throwMode === "virtual" ? (
        <DiceTray
          dice={state.dice}
          held={state.held}
          rollsUsed={state.rollsUsed}
          maxRolls={MAX_ROLLS}
          onRoll={roll}
          onToggleHold={toggleHold}
        />
      ) : (
        <ManualDiceInput
          key={`${player.id}-${Object.keys(player.scores).length}`}
          initialDice={state.dice}
          onSubmit={setManualDice}
        />
      )}

      <ScoreCard
        player={player}
        dice={state.dice}
        canSelect={canSelectCategory}
        settings={settings}
        onSelect={handleSelect}
      />

      {state.gameOver && (
        <GameOverModal
          players={state.players}
          settings={settings}
          onClose={handleGameOverClose}
        />
      )}
    </main>
  );
}
