import { createClient } from '@/lib/supabase/server';
import { CardProgress } from '@/types';
import { addDays, startOfToday } from 'date-fns';
import { isSupabaseConfigured } from '@/lib/utils/sample-data';
import {
  updateMockProgress,
  getMockProgress,
  getMockIncorrectCards,
} from '@/lib/utils/mock-storage';

export async function updateCardProgress(
  cardId: string,
  isCorrect: boolean
): Promise<CardProgress | null> {
  if (!isSupabaseConfigured()) {
    // Use mock storage
    const progress = updateMockProgress(cardId, isCorrect);
    return {
      id: `mock-${cardId}`,
      card_id: cardId,
      ...progress,
      created_at: new Date().toISOString(),
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    // Fallback to mock storage if client creation fails
    const progress = updateMockProgress(cardId, isCorrect);
    return {
      id: `mock-${cardId}`,
      card_id: cardId,
      ...progress,
      created_at: new Date().toISOString(),
    };
  }

  // Get existing progress
  const { data: existingProgress, error: fetchError } = await supabase
    .from('card_progress')
    .select('*')
    .eq('card_id', cardId)
    .single();

  const now = new Date().toISOString();
  const today = startOfToday();
  const tomorrow = addDays(today, 1);

  let updateData: Partial<CardProgress>;

  if (existingProgress) {
    // Update existing progress
    if (isCorrect) {
      const newStreak = existingProgress.correct_streak + 1;
      // Calculate next review date based on streak (spaced repetition)
      const nextReviewDays = calculateNextReviewDays(newStreak);
      const nextReviewAt = addDays(today, nextReviewDays);

      updateData = {
        correct_streak: newStreak,
        last_result: 'correct',
        last_studied_at: now,
        next_review_at: nextReviewAt.toISOString(),
      };
    } else {
      // If incorrect, reset streak and schedule for tomorrow
      updateData = {
        correct_streak: 0,
        last_result: 'incorrect',
        last_studied_at: now,
        next_review_at: tomorrow.toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('card_progress')
      .update(updateData)
      .eq('card_id', cardId)
      .select()
      .single();

    if (error) {
      console.error('Error updating card progress:', error);
      return null;
    }

    return data as CardProgress;
  } else {
    // Create new progress
    if (isCorrect) {
      const nextReviewDays = calculateNextReviewDays(1);
      const nextReviewAt = addDays(today, nextReviewDays);

      updateData = {
        card_id: cardId,
        correct_streak: 1,
        last_result: 'correct',
        last_studied_at: now,
        next_review_at: nextReviewAt.toISOString(),
      };
    } else {
      updateData = {
        card_id: cardId,
        correct_streak: 0,
        last_result: 'incorrect',
        last_studied_at: now,
        next_review_at: tomorrow.toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('card_progress')
      .insert(updateData)
      .select()
      .single();

    if (error) {
      console.error('Error creating card progress:', error);
      return null;
    }

    return data as CardProgress;
  }
}

export async function getCardProgress(cardId: string): Promise<CardProgress | null> {
  if (!isSupabaseConfigured()) {
    const progress = getMockProgress(cardId);
    if (!progress) return null;
    return {
      id: `mock-${cardId}`,
      card_id: cardId,
      ...progress,
      created_at: new Date().toISOString(),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('card_progress')
    .select('*')
    .eq('card_id', cardId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching card progress:', error);
    return null;
  }

  return data as CardProgress;
}

function calculateNextReviewDays(streak: number): number {
  // Spaced repetition algorithm
  // 1 day, 3 days, 7 days, 14 days, 30 days, etc.
  if (streak === 1) return 1;
  if (streak === 2) return 3;
  if (streak === 3) return 7;
  if (streak === 4) return 14;
  if (streak === 5) return 30;
  return 60; // For streak >= 6
}

export async function getTodayStats(): Promise<{
  totalCards: number;
  completedCards: number;
  remainingCards: number;
}> {
  if (!isSupabaseConfigured()) {
    // In sample mode, always return 30 cards
    const todayCards = await import('./cards').then(m => m.getTodayCards(30));
    return {
      totalCards: todayCards.length,
      completedCards: 0,
      remainingCards: todayCards.length,
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    const todayCards = await import('./cards').then(m => m.getTodayCards(30));
    return {
      totalCards: todayCards.length,
      completedCards: 0,
      remainingCards: todayCards.length,
    };
  }

  const today = new Date().toISOString().split('T')[0];

  // Get today's session
  const { data: session } = await supabase
    .from('daily_sessions')
    .select('*')
    .eq('date', today)
    .single();

  if (session) {
    return {
      totalCards: session.total_cards,
      completedCards: session.completed_cards,
      remainingCards: session.total_cards - session.completed_cards,
    };
  }

  // If no session exists, calculate from today's cards
  const todayCards = await import('./cards').then(m => m.getTodayCards(30));
  
  return {
    totalCards: todayCards.length,
    completedCards: 0,
    remainingCards: todayCards.length,
  };
}

