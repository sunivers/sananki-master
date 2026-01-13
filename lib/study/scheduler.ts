import { Card } from "@/types";
import { getTodayCards, getCardById } from "@/lib/db/cards";
import { loadSessionState, saveSessionState } from "@/lib/db/sessions";

export interface SessionData {
  cards: Card[];
  currentIndex: number;
  totalCards: number;
  completedCards: number;
}

export async function generateTodaySession(
  isAdditionalStudy: boolean = false
): Promise<SessionData> {
  // 기존 세션 상태 확인
  const sessionState = await loadSessionState(isAdditionalStudy);

  if (sessionState && sessionState.cardIds.length > 0) {
    // 기존 세션이 있으면 저장된 카드 ID로 복원
    const cards: Card[] = [];
    
    for (const cardId of sessionState.cardIds) {
      const card = await getCardById(cardId);
      if (card) {
        cards.push(card);
      }
    }

    return {
      cards,
      currentIndex: sessionState.currentIndex,
      totalCards: sessionState.totalCards,
      completedCards: sessionState.completedCards,
    };
  }

  // 새 세션 생성
  const limit = isAdditionalStudy ? 10 : 30;
  const cards = await getTodayCards(limit);
  const shuffledCards = shuffleArray(cards);
  const cardIds = shuffledCards.map(card => card.id);

  // 세션 상태 저장
  await saveSessionState(
    cardIds,
    0, // currentIndex
    shuffledCards.length, // totalCards
    0, // completedCards
    isAdditionalStudy
  );

  return {
    cards: shuffledCards,
    currentIndex: 0,
    totalCards: shuffledCards.length,
    completedCards: 0,
  };
}

export async function getCardsForRetry(incorrectCardIds: string[]): Promise<Card[]> {
  const { getCardById } = await import("@/lib/db/cards");
  const cards: Card[] = [];

  for (const cardId of incorrectCardIds) {
    const card = await getCardById(cardId);
    if (card) {
      cards.push(card);
    }
  }

  return cards;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
