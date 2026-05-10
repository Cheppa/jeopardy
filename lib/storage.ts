import type { Game } from "./types";

const STORAGE_KEY = "jeopardy_games";

export function getSavedGames(): Game[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveGame(game: Game): void {
  if (typeof window === "undefined") return;
  const games = getSavedGames();
  const existingIndex = games.findIndex((g) => g.id === game.id);

  if (existingIndex >= 0) {
    games[existingIndex] = game;
  } else {
    games.push(game);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function deleteGame(gameId: string): void {
  if (typeof window === "undefined") return;
  const games = getSavedGames().filter((g) => g.id !== gameId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function getGame(gameId: string): Game | null {
  return getSavedGames().find((g) => g.id === gameId) || null;
}
