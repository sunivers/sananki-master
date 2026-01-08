export type CardType = "multiple_choice";

export interface Card {
  id: string;
  category: string;
  question: string;
  answer: string; // 정답 번호 (1, 2, 3, 4)
  choices: string[]; // 선택지 배열 (4개)
  explanation?: string; // 해설
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
