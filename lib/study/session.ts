import { Card, StudySession } from '@/types';

export function createStudySession(cards: Card[]): StudySession {
  return {
    cards,
    currentIndex: 0,
    results: new Map(),
    startTime: new Date(),
  };
}

export function getCurrentCard(session: StudySession): Card | null {
  if (session.currentIndex >= session.cards.length) {
    return null;
  }
  return session.cards[session.currentIndex];
}

export function recordResult(
  session: StudySession,
  cardId: string,
  isCorrect: boolean
): void {
  session.results.set(cardId, isCorrect);
}

export function moveToNext(session: StudySession): boolean {
  session.currentIndex++;
  return session.currentIndex < session.cards.length;
}

export function isComplete(session: StudySession): boolean {
  return session.currentIndex >= session.cards.length;
}

export function getProgress(session: StudySession): {
  current: number;
  total: number;
  percentage: number;
} {
  return {
    current: session.currentIndex + 1,
    total: session.cards.length,
    percentage: Math.round(((session.currentIndex + 1) / session.cards.length) * 100),
  };
}

export function getIncorrectCards(session: StudySession): string[] {
  const incorrect: string[] = [];
  session.results.forEach((isCorrect, cardId) => {
    if (!isCorrect) {
      incorrect.push(cardId);
    }
  });
  return incorrect;
}

