"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { ChevronDown, ChevronUp, Save, Play, ArrowLeft } from "lucide-react";
import type { Game, Category, Question } from "@/lib/types";
import { POINT_VALUES, NUM_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SetupFormProps {
  game: Game;
  onSave: (game: Game) => void;
  onPlay: () => void;
  onBack: () => void;
}

function createEmptyQuestion(points: number): Question {
  return {
    id: nanoid(),
    points,
    answer: "",
    question: "",
    isPlayed: false,
  };
}

function createEmptyCategory(): Category {
  return {
    id: nanoid(),
    name: "",
    questions: POINT_VALUES.map((points) => createEmptyQuestion(points)),
  };
}

export function SetupForm({ game, onSave, onPlay, onBack }: SetupFormProps) {
  const [gameName, setGameName] = useState(game.name);
  const [categories, setCategories] = useState<Category[]>(() => {
    if (game.categories.length === NUM_CATEGORIES) {
      return game.categories;
    }
    return Array.from({ length: NUM_CATEGORIES }, () => createEmptyCategory());
  });
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    categories[0]?.id || null
  );

  const updateCategory = (categoryId: string, name: string) => {
    setCategories((cats) =>
      cats.map((cat) => (cat.id === categoryId ? { ...cat, name } : cat))
    );
  };

  const updateQuestion = (
    categoryId: string,
    questionId: string,
    field: "answer" | "question",
    value: string
  ) => {
    setCategories((cats) =>
      cats.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              questions: cat.questions.map((q) =>
                q.id === questionId ? { ...q, [field]: value } : q
              ),
            }
          : cat
      )
    );
  };

  const handleSave = () => {
    const updatedGame: Game = {
      ...game,
      name: gameName || "Untitled Game",
      categories,
    };
    onSave(updatedGame);
  };

  const handlePlay = () => {
    handleSave();
    onPlay();
  };

  const isValid = categories.every(
    (cat) =>
      cat.name.trim() &&
      cat.questions.every((q) => q.answer.trim() && q.question.trim())
  );

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--muted-foreground)] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-4 py-2 font-medium transition-colors hover:bg-[var(--border)]"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={handlePlay}
              disabled={!isValid}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors",
                isValid
                  ? "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-90"
                  : "cursor-not-allowed bg-[var(--muted)] text-[var(--muted-foreground)]"
              )}
            >
              <Play className="h-4 w-4" />
              Play
            </button>
          </div>
        </div>

        {/* Game Name */}
        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium text-[var(--muted-foreground)]">
            Game Name
          </label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="Enter game name..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 py-3 text-lg font-medium outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--secondary)]"
          />
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {categories.map((category, catIndex) => (
            <div
              key={category.id}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]"
            >
              {/* Category Header */}
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category.id ? null : category.id
                  )
                }
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--muted)]"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold">
                    {catIndex + 1}
                  </span>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateCategory(category.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={`Category ${catIndex + 1}`}
                    className="bg-transparent text-lg font-semibold uppercase tracking-wide outline-none placeholder:text-[var(--muted-foreground)]"
                  />
                </div>
                {expandedCategory === category.id ? (
                  <ChevronUp className="h-5 w-5 text-[var(--muted-foreground)]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)]" />
                )}
              </button>

              {/* Questions */}
              {expandedCategory === category.id && (
                <div className="border-t border-[var(--border)] p-4">
                  <div className="space-y-6">
                    {category.questions.map((question) => (
                      <div
                        key={question.id}
                        className="rounded-lg bg-[var(--muted)] p-4"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span className="rounded bg-[var(--secondary)] px-3 py-1 text-sm font-bold text-[var(--secondary-foreground)]">
                            ${question.points}
                          </span>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                              Clue (shown to players)
                            </label>
                            <textarea
                              value={question.answer}
                              onChange={(e) =>
                                updateQuestion(
                                  category.id,
                                  question.id,
                                  "answer",
                                  e.target.value
                                )
                              }
                              placeholder="Enter the clue..."
                              rows={3}
                              className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--secondary)]"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-[var(--muted-foreground)]">
                              Correct Response
                            </label>
                            <textarea
                              value={question.question}
                              onChange={(e) =>
                                updateQuestion(
                                  category.id,
                                  question.id,
                                  "question",
                                  e.target.value
                                )
                              }
                              placeholder="What is...?"
                              rows={3}
                              className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--secondary)]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {!isValid && (
          <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            Fill in all category names and question/answer pairs to play
          </p>
        )}
      </div>
    </div>
  );
}
