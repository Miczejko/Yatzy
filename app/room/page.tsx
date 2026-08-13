"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePartySocket } from "@/hooks/usePartySocket";
import { useRoomState } from "@/hooks/useRoomState";
import { loadPrefs, savePrefs, getPlayerId } from "@/lib/storage";
import { loadScoringSettings } from "@/lib/scoringSettings";
import { Category, MAX_ROLLS } from "@/lib/types";
import Lobby from "@/components/Lobby";
import DiceTray from "@/components/DiceTray";
import ManualDiceInput from "@/components/ManualDiceInput";
import ScoreCard from "@/components/ScoreCard";
import PlayerTabs from "@/components/PlayerTabs";
import GameControls from "@/components/GameControls";
import GameOverModal from "@/components/GameOverModal";
import MultiplayerScoreTable from "@/components/MultiplayerScoreTable";
import ConnectionStatus from "@/components/ConnectionStatus";

export default function RoomPage() {
  return (
    <Suspense fallback={null}>
      <RoomPageInner />
    </Suspense>
  );
}

function RoomPageInner() {
  const searchParams = useSearchParams();
  const roomId = (searchParams.get("id") ?? "").toUpperCase();
  const router = useRouter();

  const [playerId, setPlayerId] = useState("");
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (!roomId) return;
    const prefs = loadPrefs();
    const name = prefs.nickname || "Gracz";
    savePrefs({ nickname: name });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only session/localStorage hydration
    setPlayerId(getPlayerId(roomId));
    setNickname(name);
  }, [roomId]);

  const { roomState, error, kicked, handleServerMessage } = useRoomState();
  const prefsForJoin = useMemo(() => loadPrefs(), []);
  const scoringSettings = useMemo(() => loadScoringSettings(), []);

  const { status, startGame, rollDice, toggleHold, submitManualDice, selectCategory, endGameRequest, rename, kickPlayer } =
    usePartySocket({
      roomId,
      playerId,
      nickname,
      throwMode: prefsForJoin.throwMode,
      settings: scoringSettings,
      onServerMessage: handleServerMessage,
    });

  if (!roomId || !playerId || !nickname) return null;

  if (kicked) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-4 text-center">
        <p className="text-slate-700 font-medium">
          Zostałeś usunięty z pokoju przez hosta.
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold shadow active:scale-95 transition"
        >
          Wróć do strony głównej
        </button>
      </main>
    );
  }

  if (!roomState) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-4">
        <ConnectionStatus status={status} />
        <p className="text-slate-500">Łączenie z pokojem...</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </main>
    );
  }

  const me = roomState.players.find((p) => p.id === playerId);
  const isHost = me?.isHost ?? false;

  const handleRename = (name: string) => {
    rename(name);
    savePrefs({ nickname: name });
    setNickname(name);
  };

  if (roomState.phase === "lobby") {
    return (
      <main className="flex-1 flex flex-col gap-4 px-3 py-8 max-w-2xl mx-auto w-full">
        <ConnectionStatus status={status} />
        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}
        <Lobby
          roomId={roomState.roomId}
          players={roomState.players}
          maxPlayers={roomState.maxPlayers}
          isHost={isHost}
          myPlayerId={playerId}
          onStart={startGame}
          onRename={handleRename}
          onKick={kickPlayer}
        />
      </main>
    );
  }

  const currentPlayer = roomState.players[roomState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const canSelectCategory = isMyTurn && roomState.hasRolledThisTurn;

  const handleSelect = (category: Category) => {
    selectCategory(category);
  };

  const handleGameOverClose = () => {
    router.push("/");
  };

  return (
    <main className="flex-1 flex flex-col gap-4 px-3 py-4 max-w-2xl mx-auto w-full">
      <ConnectionStatus status={status} />
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <PlayerTabs
        players={roomState.players}
        currentPlayerIndex={roomState.currentPlayerIndex}
      />
      <GameControls
        round={roomState.round}
        totalRounds={13}
        isHost={isHost}
        onEndGame={endGameRequest}
      />

      {!isMyTurn && (
        <p className="text-center text-sm text-slate-500 -mt-2">
          Tura gracza: <span className="font-semibold">{currentPlayer?.name}</span>
        </p>
      )}

      {roomState.throwMode === "virtual" ? (
        <DiceTray
          dice={roomState.dice}
          held={roomState.held}
          rollsUsed={roomState.rollsUsed}
          maxRolls={MAX_ROLLS}
          disabled={!isMyTurn}
          onRoll={rollDice}
          onToggleHold={toggleHold}
        />
      ) : (
        <ManualDiceInput
          key={`${currentPlayer?.id}-${Object.keys(currentPlayer?.scores ?? {}).length}`}
          initialDice={roomState.dice}
          disabled={!isMyTurn}
          onSubmit={submitManualDice}
        />
      )}

      {currentPlayer && (
        <ScoreCard
          player={currentPlayer}
          dice={roomState.dice}
          canSelect={canSelectCategory}
          settings={roomState.settings}
          onSelect={handleSelect}
        />
      )}

      <MultiplayerScoreTable
        players={roomState.players}
        currentPlayerIndex={roomState.currentPlayerIndex}
        settings={roomState.settings}
      />

      {roomState.phase === "finished" && (
        <GameOverModal
          players={roomState.players}
          settings={roomState.settings}
          onClose={handleGameOverClose}
        />
      )}
    </main>
  );
}
