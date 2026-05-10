"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { parse as parseYaml } from "yaml";
import {
  ChevronDown,
  ChevronUp,
  Save,
  Play,
  ArrowLeft,
  Upload,
  X,
  Copy,
  Check,
} from "lucide-react";
import type { Game, Category, Question } from "@/lib/types";
import { POINT_VALUES, NUM_CATEGORIES } from "@/lib/types";
import { cn } from "@/lib/utils";

const YAML_TEMPLATE = `# Jeopardy Game Import Format
# Paste your categories and questions below in this YAML format
# You need exactly 6 categories, each with 5 questions (100-500 points)

game_name: My Jeopardy Game

categories:
  - name: WORLD CAPITALS
    questions:
      - points: 100
        clue: This European capital sits on the Danube River
        response: What is Budapest?
      - points: 200
        clue: The capital of Japan with over 13 million residents
        response: What is Tokyo?
      - points: 300
        clue: This South American capital is the highest in the world
        response: What is La Paz?
      - points: 400
        clue: The capital of Australia, often confused with Sydney
        response: What is Canberra?
      - points: 500
        clue: This Scandinavian capital means "Merchant's Harbor"
        response: What is Copenhagen?

  - name: SCIENCE
    questions:
      - points: 100
        clue: The chemical symbol for gold
        response: What is Au?
      - points: 200
        clue: The number of bones in the adult human body
        response: What is 206?
      - points: 300
        clue: The process by which plants convert sunlight to energy
        response: What is photosynthesis?
      - points: 400
        clue: The only planet that rotates clockwise
        response: What is Venus?
      - points: 500
        clue: The particle that carries the electromagnetic force
        response: What is a photon?

  # Add 4 more categories following the same format...
`;

interface YamlGame {
  game_name?: string;
  categories: Array<{
    name: string;
    questions: Array<{
      points: number;
      clue: string;
      response: string;
    }>;
  }>;
}

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
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyTemplate = async () => {
    await navigator.clipboard.writeText(YAML_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setImportError(null);
    try {
      const parsed = parseYaml(importText) as YamlGame;

      if (!parsed || !parsed.categories) {
        throw new Error("Invalid format: missing 'categories' field");
      }

      if (parsed.categories.length !== NUM_CATEGORIES) {
        throw new Error(
          `Need exactly ${NUM_CATEGORIES} categories, found ${parsed.categories.length}`
        );
      }

      const newCategories: Category[] = parsed.categories.map((cat) => {
        if (!cat.name) {
          throw new Error("Each category must have a 'name' field");
        }
        if (!cat.questions || cat.questions.length !== POINT_VALUES.length) {
          throw new Error(
            `Category "${cat.name}" must have exactly ${POINT_VALUES.length} questions`
          );
        }

        const questions: Question[] = POINT_VALUES.map((points) => {
          const q = cat.questions.find((q) => q.points === points);
          if (!q) {
            throw new Error(
              `Category "${cat.name}" is missing a ${points}-point question`
            );
          }
          if (!q.clue || !q.response) {
            throw new Error(
              `${points}-point question in "${cat.name}" must have 'clue' and 'response'`
            );
          }
          return {
            id: nanoid(),
            points,
            answer: q.clue,
            question: q.response,
            isPlayed: false,
          };
        });

        return {
          id: nanoid(),
          name: cat.name.toUpperCase(),
          questions,
        };
      });

      if (parsed.game_name) {
        setGameName(parsed.game_name);
      }
      setCategories(newCategories);
      setExpandedCategory(newCategories[0]?.id || null);
      setShowImportModal(false);
      setImportText("");
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : "Failed to parse YAML"
      );
    }
  };

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
              onClick={() => {
                setShowImportModal(true);
                setImportError(null);
              }}
              className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-4 py-2 font-medium transition-colors hover:bg-[var(--border)]"
            >
              <Upload className="h-4 w-4" />
              Import YAML
            </button>
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <h2 className="text-xl font-bold">Import from YAML</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText("");
                  setImportError(null);
                }}
                className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-4">
              <div className="mb-4 rounded-lg bg-[var(--muted)] p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold">YAML Format</h3>
                  <button
                    onClick={copyTemplate}
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Template
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Paste your game data in YAML format. You need exactly 6
                  categories, each with 5 questions (100, 200, 300, 400, 500
                  points). Click &quot;Copy Template&quot; for an example.
                </p>
              </div>

              <textarea
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError(null);
                }}
                placeholder="Paste your YAML here..."
                rows={15}
                className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--input)] p-4 font-mono text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--secondary)]"
              />

              {importError && (
                <div className="mt-3 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
                  <strong>Error:</strong> {importError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-[var(--border)] p-4">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportText("");
                  setImportError(null);
                }}
                className="rounded-lg bg-[var(--muted)] px-4 py-2 font-medium transition-colors hover:bg-[var(--border)]"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className={cn(
                  "rounded-lg px-4 py-2 font-medium transition-colors",
                  importText.trim()
                    ? "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-90"
                    : "cursor-not-allowed bg-[var(--muted)] text-[var(--muted-foreground)]"
                )}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
