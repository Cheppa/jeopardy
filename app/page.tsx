"use client";

import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { Plus, Play, Trash2, Edit } from "lucide-react";
import type { Game } from "@/lib/types";
import { getSavedGames, saveGame, deleteGame } from "@/lib/storage";
import { SetupForm } from "@/components/jeopardy/setup-form";
import { GameBoard } from "@/components/jeopardy/game-board";

type View = "home" | "setup" | "play";

function createNewGame(): Game {
  return {
    id: nanoid(),
    name: "",
    categories: [],
    teams: [],
    createdAt: new Date().toISOString(),
  };
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [savedGames, setSavedGames] = useState<Game[]>([]);

  useEffect(() => {
    setSavedGames(getSavedGames());
  }, []);

  const handleNewGame = () => {
    setCurrentGame(createNewGame());
    setView("setup");
  };

  const handleEditGame = (game: Game) => {
    setCurrentGame(game);
    setView("setup");
  };

  const handlePlayGame = (game: Game) => {
    setCurrentGame(game);
    setView("play");
  };

  const handleSaveGame = (game: Game) => {
    saveGame(game);
    setCurrentGame(game);
    setSavedGames(getSavedGames());
  };

  const handleDeleteGame = (gameId: string) => {
    deleteGame(gameId);
    setSavedGames(getSavedGames());
  };

  const handleUpdateGame = (game: Game) => {
    saveGame(game);
    setCurrentGame(game);
  };

  const handleBackToHome = () => {
    setView("home");
    setCurrentGame(null);
    setSavedGames(getSavedGames());
  };

  if (view === "setup" && currentGame) {
    return (
      <SetupForm
        game={currentGame}
        onSave={handleSaveGame}
        onPlay={() => setView("play")}
        onBack={handleBackToHome}
      />
    );
  }

  if (view === "play" && currentGame) {
    return (
      <GameBoard
        game={currentGame}
        onUpdateGame={handleUpdateGame}
        onExit={handleBackToHome}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo / Title */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-5xl font-bold tracking-tight md:text-6xl">
            <span className="text-[var(--secondary)]">JEOPARDY</span>
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Game Master Tool
          </p>
        </div>

        {/* New Game Button */}
        <button
          onClick={handleNewGame}
          className="mb-8 flex w-full items-center justify-center gap-3 rounded-xl bg-[var(--secondary)] px-6 py-4 text-lg font-semibold text-[var(--secondary-foreground)] transition-opacity hover:opacity-90"
        >
          <Plus className="h-6 w-6" />
          Create New Game
        </button>

        {/* Saved Games */}
        {savedGames.length > 0 && (
          <div>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Saved Games
            </h2>
            <div className="space-y-3">
              {savedGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"
                >
                  <div>
                    <h3 className="font-semibold">
                      {game.name || "Untitled Game"}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {game.categories.length} categories •{" "}
                      {new Date(game.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditGame(game)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-white"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handlePlayGame(game)}
                      className="rounded-lg bg-[var(--primary)] p-2 text-white transition-colors hover:bg-[var(--primary)]/80"
                      title="Play"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGame(game.id)}
                      className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-red-900/50 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
