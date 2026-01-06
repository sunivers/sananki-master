// In-memory storage for sample data mode
// This simulates database storage when Supabase is not configured

interface MockProgress {
  [cardId: string]: {
    correct_streak: number;
    last_result: 'correct' | 'incorrect' | null;
    last_studied_at: string | null;
    next_review_at: string | null;
  };
}

let mockProgress: MockProgress = {};

// Load from localStorage if available (for persistence across page refreshes)
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('sananki_mock_progress');
    if (stored) {
      mockProgress = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load mock progress from localStorage:', e);
  }
}

function saveProgress() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('sananki_mock_progress', JSON.stringify(mockProgress));
    } catch (e) {
      console.warn('Failed to save mock progress to localStorage:', e);
    }
  }
}

export function getMockProgress(cardId: string) {
  return mockProgress[cardId] || null;
}

export function updateMockProgress(
  cardId: string,
  isCorrect: boolean
): {
  correct_streak: number;
  last_result: 'correct' | 'incorrect';
  last_studied_at: string;
  next_review_at: string;
} {
  const existing = mockProgress[cardId];
  const now = new Date().toISOString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  let nextReviewDays = 1;
  if (isCorrect) {
    const currentStreak = existing?.correct_streak || 0;
    const newStreak = currentStreak + 1;
    
    // Spaced repetition
    if (newStreak === 1) nextReviewDays = 1;
    else if (newStreak === 2) nextReviewDays = 3;
    else if (newStreak === 3) nextReviewDays = 7;
    else if (newStreak === 4) nextReviewDays = 14;
    else if (newStreak === 5) nextReviewDays = 30;
    else nextReviewDays = 60;

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextReviewDays);

    mockProgress[cardId] = {
      correct_streak: newStreak,
      last_result: 'correct',
      last_studied_at: now,
      next_review_at: nextReview.toISOString(),
    };
  } else {
    mockProgress[cardId] = {
      correct_streak: 0,
      last_result: 'incorrect',
      last_studied_at: now,
      next_review_at: tomorrow.toISOString(),
    };
  }

  saveProgress();
  return mockProgress[cardId] as any;
}

export function getMockIncorrectCards(): string[] {
  return Object.keys(mockProgress).filter(
    cardId => mockProgress[cardId].last_result === 'incorrect'
  );
}

export function resetMockProgress() {
  mockProgress = {};
  saveProgress();
}

