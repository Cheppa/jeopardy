"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { nanoid } from "nanoid";
import type { Team } from "@/lib/types";

interface TeamManagerProps {
  teams: Team[];
  onAddTeam: (team: Team) => void;
}

export function TeamManager({ teams, onAddTeam }: TeamManagerProps) {
  const [newTeamName, setNewTeamName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTeam = () => {
    if (!newTeamName.trim()) return;

    onAddTeam({
      id: nanoid(),
      name: newTeamName.trim(),
      score: 0,
    });
    setNewTeamName("");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-[var(--muted)] px-4 py-2 font-medium transition-colors hover:bg-[var(--border)]"
      >
        <Users className="h-4 w-4" />
        Teams ({teams.length})
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-xl">
            <h3 className="mb-4 font-semibold">Add Team</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTeam();
                }}
                placeholder="Team name..."
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--secondary)]"
                autoFocus
              />
              <button
                onClick={handleAddTeam}
                disabled={!newTeamName.trim()}
                className="rounded-lg bg-[var(--secondary)] p-2 text-[var(--secondary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {teams.length > 0 && (
              <div className="mt-4 border-t border-[var(--border)] pt-4">
                <p className="mb-2 text-xs text-[var(--muted-foreground)]">
                  Current teams:
                </p>
                <div className="space-y-1">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between rounded bg-[var(--muted)] px-3 py-1.5 text-sm"
                    >
                      <span>{team.name}</span>
                      <span className="text-[var(--secondary)]">
                        ${team.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
