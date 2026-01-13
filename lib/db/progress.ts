import { createClient } from '@/lib/supabase/server';
import { CardProgress } from '@/types';
import { addDays, startOfToday } from 'date-fns';
import { isSupabaseConfigured } from '@/lib/utils/sample-data';
import {
  updateMockProgress,
  getMockProgress,
  getMockIncorrectCards,
} from '@/lib/utils/mock-storage';
import { getKSTDateString } from '@/lib/utils/kst-date';
import { updateSessionProgress } from './sessions';

export async function updateCardProgress(
  cardId: string,
  isCorrect: boolean,
  currentIndex?: number,
  isAdditionalStudy?: boolean
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

    // 세션 진행 상황 업데이트 (currentIndex가 제공된 경우)
    if (currentIndex !== undefined) {
      const { loadSessionState } = await import('./sessions');
      const sessionState = await loadSessionState(isAdditionalStudy || false);
      if (sessionState) {
        const newCompletedCards = Math.max(
          sessionState.completedCards,
          currentIndex + 1
        );
        await updateSessionProgress(
          currentIndex + 1,
          newCompletedCards,
          isAdditionalStudy || false
        );
      }
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

    // 세션 진행 상황 업데이트 (currentIndex가 제공된 경우)
    if (currentIndex !== undefined) {
      const { loadSessionState } = await import('./sessions');
      const sessionState = await loadSessionState(isAdditionalStudy || false);
      if (sessionState) {
        const newCompletedCards = Math.max(
          sessionState.completedCards,
          currentIndex + 1
        );
        await updateSessionProgress(
          currentIndex + 1,
          newCompletedCards,
          isAdditionalStudy || false
        );
      }
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
    // In sample mode, check localStorage for session state
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sananki_session_state');
      if (stored) {
        try {
          const sessionState = JSON.parse(stored);
          if (sessionState.date === getKSTDateString() && !sessionState.is_additional_study) {
            return {
              totalCards: sessionState.total_cards || 0,
              completedCards: sessionState.completed_cards || 0,
              remainingCards: (sessionState.total_cards || 0) - (sessionState.completed_cards || 0),
            };
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
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

  // 한국 시간 기준 날짜 사용
  const today = getKSTDateString();

  // Get today's session (일반 학습만, 추가 학습 제외)
  const { data: session } = await supabase
    .from('daily_sessions')
    .select('*')
    .eq('date', today)
    .eq('is_additional_study', false)
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

