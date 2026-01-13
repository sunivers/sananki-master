import { createClient } from '@/lib/supabase/server';
import { DailySession, Card } from '@/types';
import { getKSTDateString, isAfterKSTReset } from '@/lib/utils/kst-date';
import { isSupabaseConfigured } from '@/lib/utils/sample-data';

/**
 * 오늘의 세션 상태 저장
 */
export async function saveSessionState(
  cardIds: string[],
  currentIndex: number,
  totalCards: number,
  completedCards: number,
  isAdditionalStudy: boolean = false
): Promise<DailySession | null> {
  if (!isSupabaseConfigured()) {
    // Mock mode에서는 localStorage 사용
    if (typeof window !== 'undefined') {
      const sessionState = {
        date: getKSTDateString(),
        card_ids: cardIds,
        current_index: currentIndex,
        total_cards: totalCards,
        completed_cards: completedCards,
        is_additional_study: isAdditionalStudy,
      };
      localStorage.setItem('sananki_session_state', JSON.stringify(sessionState));
    }
    return {
      id: 'mock-session',
      date: getKSTDateString(),
      total_cards: totalCards,
      completed_cards: completedCards,
      card_ids: cardIds,
      current_index: currentIndex,
      is_additional_study: isAdditionalStudy,
    } as any;
  }

  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const date = getKSTDateString();

  // 기존 세션 확인
  const { data: existingSession } = await supabase
    .from('daily_sessions')
    .select('*')
    .eq('date', date)
    .eq('is_additional_study', isAdditionalStudy)
    .single();

  const sessionData = {
    date,
    card_ids: cardIds,
    current_index: currentIndex,
    total_cards: totalCards,
    completed_cards: completedCards,
    is_additional_study: isAdditionalStudy,
  };

  if (existingSession) {
    // 업데이트
    const { data, error } = await supabase
      .from('daily_sessions')
      .update(sessionData)
      .eq('id', existingSession.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session state:', error);
      return null;
    }

    return data as DailySession;
  } else {
    // 생성
    const { data, error } = await supabase
      .from('daily_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating session state:', error);
      return null;
    }

    return data as DailySession;
  }
}

/**
 * 저장된 세션 상태 불러오기
 */
export async function loadSessionState(
  isAdditionalStudy: boolean = false
): Promise<{
  cardIds: string[];
  currentIndex: number;
  totalCards: number;
  completedCards: number;
} | null> {
  if (!isSupabaseConfigured()) {
    // Mock mode에서는 localStorage 사용
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sananki_session_state');
      if (stored) {
        try {
          const sessionState = JSON.parse(stored);
          if (sessionState.date === getKSTDateString() && 
              sessionState.is_additional_study === isAdditionalStudy) {
            return {
              cardIds: sessionState.card_ids || [],
              currentIndex: sessionState.current_index || 0,
              totalCards: sessionState.total_cards || 0,
              completedCards: sessionState.completed_cards || 0,
            };
          }
        } catch (e) {
          console.warn('Failed to load session state from localStorage:', e);
        }
      }
    }
    return null;
  }

  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const date = getKSTDateString();

  const { data: session, error } = await supabase
    .from('daily_sessions')
    .select('*')
    .eq('date', date)
    .eq('is_additional_study', isAdditionalStudy)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error loading session state:', error);
    return null;
  }

  if (!session) {
    return null;
  }

  return {
    cardIds: (session.card_ids as string[]) || [],
    currentIndex: session.current_index || 0,
    totalCards: session.total_cards || 0,
    completedCards: session.completed_cards || 0,
  };
}

/**
 * 세션 진행 상황 업데이트 (카드 완료 시)
 */
export async function updateSessionProgress(
  currentIndex: number,
  completedCards: number,
  isAdditionalStudy: boolean = false
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // Mock mode에서는 localStorage 업데이트
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sananki_session_state');
      if (stored) {
        try {
          const sessionState = JSON.parse(stored);
          sessionState.current_index = currentIndex;
          sessionState.completed_cards = completedCards;
          localStorage.setItem('sananki_session_state', JSON.stringify(sessionState));
        } catch (e) {
          console.warn('Failed to update session state in localStorage:', e);
        }
      }
    }
    return true;
  }

  const supabase = await createClient();
  if (!supabase) {
    return false;
  }

  const date = getKSTDateString();

  const { error } = await supabase
    .from('daily_sessions')
    .update({
      current_index: currentIndex,
      completed_cards: completedCards,
    })
    .eq('date', date)
    .eq('is_additional_study', isAdditionalStudy);

  if (error) {
    console.error('Error updating session progress:', error);
    return false;
  }

  return true;
}

/**
 * 새벽 2시 이후 새 세션 생성 (기존 세션 완료 처리)
 */
export async function resetDailySession(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    // Mock mode에서는 localStorage 초기화
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sananki_session_state');
      if (stored) {
        try {
          const sessionState = JSON.parse(stored);
          const storedDate = sessionState.date;
          const currentDate = getKSTDateString();
          
          // 날짜가 다르면 초기화
          if (storedDate !== currentDate) {
            localStorage.removeItem('sananki_session_state');
          }
        } catch (e) {
          console.warn('Failed to reset session state in localStorage:', e);
        }
      }
    }
    return true;
  }

  // 새벽 2시 이후인지 확인
  if (!isAfterKSTReset()) {
    return false;
  }

  // 이 함수는 주로 날짜 변경 감지 시 호출되므로
  // 실제 리셋은 loadSessionState에서 날짜가 다르면 자동으로 처리됨
  return true;
}

/**
 * 오늘의 세션 통계 가져오기
 */
export async function getTodaySessionStats(
  isAdditionalStudy: boolean = false
): Promise<{
  totalCards: number;
  completedCards: number;
  remainingCards: number;
} | null> {
  const sessionState = await loadSessionState(isAdditionalStudy);
  
  if (!sessionState) {
    return null;
  }

  return {
    totalCards: sessionState.totalCards,
    completedCards: sessionState.completedCards,
    remainingCards: sessionState.totalCards - sessionState.completedCards,
  };
}
