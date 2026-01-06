import { Card } from "@/types";
import { getTodayCards } from "@/lib/db/cards";

export async function generateTodaySession(): Promise<Card[]> {
  // Get 30 cards for today
  const cards = await getTodayCards(30);

  // Shuffle the cards
  return shuffleArray(cards);
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
