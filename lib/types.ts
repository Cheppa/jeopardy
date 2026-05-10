export interface Question {
  id: string;
  points: number;
  answer: string; // The clue shown (in Jeopardy, "answers" are shown first)
  question: string; // The correct response
  isPlayed: boolean;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface Game {
  id: string;
  name: string;
  categories: Category[];
  teams: Team[];
  createdAt: string;
}

export const POINT_VALUES = [100, 200, 300, 400, 500] as const;
export const NUM_CATEGORIES = 6;
