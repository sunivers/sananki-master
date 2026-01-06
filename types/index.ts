export type CardType = "ox" | "blank" | "short";

export interface Card {
  id: string;
  category: string;
  question: string;
  answer: string;
  type: CardType;
  source?: string;
  created_at?: string;
}

export interface CardProgress {
  id: string;
  card_id: string;
  correct_streak: number;
  last_result: "correct" | "incorrect" | null;
  last_studied_at: string | null;
  next_review_at: string | null;
  created_at?: string;
}

export interface DailySession {
  id: string;
  date: string;
  total_cards: number;
  completed_cards: number;
  created_at?: string;
}

export interface StudySession {
  cards: Card[];
  currentIndex: number;
  results: Map<string, boolean>; // card_id -> isCorrect
  startTime: Date;
}
