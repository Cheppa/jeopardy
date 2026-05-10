"use client";

import { useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { Game, Question, Category, Team } from "@/lib/types";
import { POINT_VALUES } from "@/lib/types";
import { QuestionModal } from "./question-modal";
import { Scoreboard } from "./scoreboard";
import { TeamManager } from "./team-manager";
import { cn } from "@/lib/utils";

interface GameBoardProps {
  game: Game;
  onUpdateGame: (game: Game) => void;
  onExit: () => void;
}

export function GameBoard({ game, onUpdateGame, onExit }: GameBoardProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<{
    question: Question;
    category: Category;
  } | null>(null);
  const [lastPlayedPoints, setLastPlayedPoints] = useState<number | null>(null);

  const handleSelectQuestion = (category: Category, question: Question) => {
    if (question.isPlayed) return;
    setSelectedQuestion({ question, category });
    setLastPlayedPoints(question.points);
  };

  const handleMarkPlayed = () => {
    if (!selectedQuestion) return;

    const updatedCategories = game.categories.map((cat) =>
      cat.id === selectedQuestion.category.id
        ? {
            ...cat,
            questions: cat.questions.map((q) =>
              q.id === selectedQuestion.question.id
                ? { ...q, isPlayed: true }
                : q
            ),
          }
        : cat
    );

    onUpdateGame({ ...game, categories: updatedCategories });
  };

  const handleUpdateScore = (teamId: string, delta: number) => {
    const updatedTeams = game.teams.map((team) =>
      team.id === teamId ? { ...team, score: team.score + delta } : team
    );
    onUpdateGame({ ...game, teams: updatedTeams });
  };

  const handleAddTeam = (team: Team) => {
    onUpdateGame({ ...game, teams: [...game.teams, team] });
  };

  const handleRemoveTeam = (teamId: string) => {
    onUpdateGame({
      ...game,
      teams: game.teams.filter((t) => t.id !== teamId),
    });
  };

  const handleRenameTeam = (teamId: string, name: string) => {
    const updatedTeams = game.teams.map((team) =>
      team.id === teamId ? { ...team, name } : team
    );
    onUpdateGame({ ...game, teams: updatedTeams });
  };

  const handleReset = () => {
    const resetCategories = game.categories.map((cat) => ({
      ...cat,
      questions: cat.questions.map((q) => ({ ...q, isPlayed: false })),
    }));
    const resetTeams = game.teams.map((team) => ({ ...team, score: 0 }));
    onUpdateGame({ ...game, categories: resetCategories, teams: resetTeams });
    setLastPlayedPoints(null);
  };

  const allPlayed = game.categories.every((cat) =>
    cat.questions.every((q) => q.isPlayed)
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex items-center gap-2 text-[var(--muted-foreground)] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Exit
          </button>
          <h1 className="text-xl font-bold">{game.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--border)]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <TeamManager teams={game.teams} onAddTeam={handleAddTeam} />
        </div>
      </header>

      {/* Game Board */}
      <main className="flex flex-1 flex-col p-6">
        <div className="mx-auto w-full max-w-7xl flex-1">
          {/* Board Grid */}
          <div className="mb-6 grid grid-cols-6 gap-2">
            {/* Category Headers */}
            {game.categories.map((category) => (
              <div
                key={category.id}
                className="flex min-h-[80px] items-center justify-center rounded-lg bg-[var(--primary)] p-3 text-center"
              >
                <span className="text-sm font-bold uppercase tracking-wider md:text-base lg:text-lg">
                  {category.name}
                </span>
              </div>
            ))}

            {/* Question Cells */}
            {POINT_VALUES.map((points) =>
              game.categories.map((category) => {
                const question = category.questions.find(
                  (q) => q.points === points
                );
                if (!question) return null;

                return (
                  <button
                    key={`${category.id}-${points}`}
                    onClick={() => handleSelectQuestion(category, question)}
                    disabled={question.isPlayed}
                    className={cn(
                      "flex min-h-[100px] items-center justify-center rounded-lg transition-all duration-200 md:min-h-[120px]",
                      question.isPlayed
                        ? "cursor-default bg-[var(--muted)]/30"
                        : "cursor-pointer bg-[var(--primary)] shadow-lg hover:scale-[1.02] hover:bg-[var(--primary)]/80 hover:shadow-xl"
                    )}
                  >
                    {!question.isPlayed && (
                      <span className="text-2xl font-bold text-[var(--secondary)] md:text-3xl lg:text-4xl">
                        ${points}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* All Played Message */}
          {allPlayed && (
            <div className="mb-6 rounded-xl bg-[var(--secondary)]/20 p-6 text-center">
              <p className="text-2xl font-bold text-[var(--secondary)]">
                Game Complete!
              </p>
              <p className="mt-2 text-[var(--muted-foreground)]">
                All questions have been played
              </p>
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="border-t border-[var(--border)] pt-6">
          <Scoreboard
            teams={game.teams}
            onUpdateScore={handleUpdateScore}
            onRemoveTeam={handleRemoveTeam}
            onRenameTeam={handleRenameTeam}
            selectedPoints={lastPlayedPoints}
          />
        </div>
      </main>

      {/* Question Modal */}
      {selectedQuestion && (
        <QuestionModal
          question={selectedQuestion.question}
          category={selectedQuestion.category}
          onClose={() => setSelectedQuestion(null)}
          onMarkPlayed={handleMarkPlayed}
        />
      )}
    </div>
  );
}
