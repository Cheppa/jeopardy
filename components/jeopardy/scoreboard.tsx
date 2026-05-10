"use client";

import { Plus, Minus, X, Edit2, Check } from "lucide-react";
import { useState } from "react";
import type { Team } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ScoreboardProps {
  teams: Team[];
  onUpdateScore: (teamId: string, delta: number) => void;
  onRemoveTeam: (teamId: string) => void;
  onRenameTeam: (teamId: string, name: string) => void;
  selectedPoints: number | null;
}

export function Scoreboard({
  teams,
  onUpdateScore,
  onRemoveTeam,
  onRenameTeam,
  selectedPoints,
}: ScoreboardProps) {
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const startEditing = (team: Team) => {
    setEditingTeam(team.id);
    setEditName(team.name);
  };

  const saveEdit = (teamId: string) => {
    if (editName.trim()) {
      onRenameTeam(teamId, editName.trim());
    }
    setEditingTeam(null);
  };

  if (teams.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {teams.map((team) => (
        <div
          key={team.id}
          className="flex items-center gap-3 rounded-xl bg-[var(--card)] px-4 py-3 shadow-lg"
        >
          {/* Team Name */}
          {editingTeam === team.id ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit(team.id);
                  if (e.key === "Escape") setEditingTeam(null);
                }}
                className="w-24 rounded bg-[var(--muted)] px-2 py-1 text-sm font-medium outline-none"
                autoFocus
              />
              <button
                onClick={() => saveEdit(team.id)}
                className="text-[var(--secondary)] hover:opacity-80"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{team.name}</span>
              <button
                onClick={() => startEditing(team)}
                className="text-[var(--muted-foreground)] transition-colors hover:text-white"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Score */}
          <span
            className={cn(
              "min-w-[80px] text-center text-2xl font-bold",
              team.score >= 0 ? "text-[var(--secondary)]" : "text-red-500"
            )}
          >
            ${team.score.toLocaleString()}
          </span>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                onUpdateScore(team.id, -(selectedPoints || 100))
              }
              className="rounded-lg bg-red-900/50 p-2 text-red-400 transition-colors hover:bg-red-900"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                onUpdateScore(team.id, selectedPoints || 100)
              }
              className="rounded-lg bg-green-900/50 p-2 text-green-400 transition-colors hover:bg-green-900"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRemoveTeam(team.id)}
              className="ml-1 rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}

      {selectedPoints && (
        <div className="rounded-lg bg-[var(--muted)] px-3 py-1.5 text-sm text-[var(--muted-foreground)]">
          +/- ${selectedPoints}
        </div>
      )}
    </div>
  );
}
