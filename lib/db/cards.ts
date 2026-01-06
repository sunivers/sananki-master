import { createClient } from '@/lib/supabase/server';
import { Card } from '@/types';
import { getSampleCards, isSupabaseConfigured } from '@/lib/utils/sample-data';

export async function getTodayCards(limit: number = 30): Promise<Card[]> {
  if (!isSupabaseConfigured()) {
    // Return sample data
    const sampleCards = getSampleCards();
    return sampleCards.slice(0, limit);
  }

  const supabase = await createClient();
  if (!supabase) {
    const sampleCards = getSampleCards();
    return sampleCards.slice(0, limit);
  }

  const today = new Date().toISOString().split('T')[0];

  // 1. Get cards that are due for review (next_review_at <= today or null)
  const { data: dueCards, error: dueError } = await supabase
    .from('card_progress')
    .select('card_id, next_review_at')
    .or(`next_review_at.is.null,next_review_at.lte.${today}`)
    .limit(limit);

  if (dueError) {
    console.error('Error fetching due cards:', dueError);
  }

  const dueCardIds = dueCards?.map((cp: { card_id: string }) => cp.card_id) || [];

  // 2. Get cards without progress (new cards)
  const { data: allCards, error: allError } = await supabase
    .from('cards')
    .select('*');

  if (allError) {
    console.error('Error fetching all cards:', allError);
    return [];
  }

  const { data: progressCards } = await supabase
    .from('card_progress')
    .select('card_id');

  const progressCardIds = new Set(progressCards?.map((cp: { card_id: string }) => cp.card_id) || []);
  const newCards = (allCards as Card[])?.filter((card: Card) => !progressCardIds.has(card.id)) || [];

  // 3. Get cards with progress that are due
  const { data: dueCardsData, error: dueCardsError } = await supabase
    .from('cards')
    .select('*')
    .in('id', dueCardIds);

  if (dueCardsError) {
    console.error('Error fetching due cards data:', dueCardsError);
  }

  // 4. Combine and limit to 30 cards
  const selectedCards: Card[] = [];
  
  // Add due cards first
  if (dueCardsData) {
    selectedCards.push(...dueCardsData as Card[]);
  }
  
  // Add new cards if we need more
  if (selectedCards.length < limit) {
    const remaining = limit - selectedCards.length;
    selectedCards.push(...newCards.slice(0, remaining) as Card[]);
  }
  
  // If still not enough, add random cards
  if (selectedCards.length < limit && allCards) {
    const selectedIds = new Set(selectedCards.map((c: Card) => c.id));
    const remainingCards = (allCards as Card[]).filter((c: Card) => !selectedIds.has(c.id));
    const remaining = limit - selectedCards.length;
    const randomCards = remainingCards
      .sort(() => Math.random() - 0.5)
      .slice(0, remaining);
    selectedCards.push(...randomCards);
  }

  return selectedCards.slice(0, limit);
}

export async function getCardById(id: string): Promise<Card | null> {
  if (!isSupabaseConfigured()) {
    const sampleCards = getSampleCards();
    return sampleCards.find(card => card.id === id) || null;
  }

  const supabase = await createClient();
  if (!supabase) {
    const sampleCards = getSampleCards();
    return sampleCards.find(card => card.id === id) || null;
  }

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching card:', error);
    return null;
  }

  return data as Card;
}

export async function getReviewCards(): Promise<Card[]> {
  if (!isSupabaseConfigured()) {
    // In sample mode, get incorrect cards from mock storage
    const { getMockIncorrectCards } = await import('@/lib/utils/mock-storage');
    const incorrectCardIds = getMockIncorrectCards();
    
    if (incorrectCardIds.length === 0) {
      return [];
    }

    const sampleCards = getSampleCards();
    return sampleCards.filter(card => incorrectCardIds.includes(card.id));
  }

  const supabase = await createClient();
  if (!supabase) {
    return [];
  }
  
  // Get cards with incorrect last result
  const { data: incorrectProgress, error: progressError } = await supabase
    .from('card_progress')
    .select('card_id')
    .eq('last_result', 'incorrect');

  if (progressError) {
    console.error('Error fetching incorrect cards:', progressError);
    return [];
  }

  const incorrectCardIds = incorrectProgress?.map((cp: { card_id: string }) => cp.card_id) || [];

  if (incorrectCardIds.length === 0) {
    return [];
  }

  const { data: cards, error: cardsError } = await supabase
    .from('cards')
    .select('*')
    .in('id', incorrectCardIds);

  if (cardsError) {
    console.error('Error fetching review cards:', cardsError);
    return [];
  }

  return cards as Card[];
}

