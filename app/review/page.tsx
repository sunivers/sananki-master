'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CardStudy from '@/components/CardStudy';
import ProgressBar from '@/components/ProgressBar';
import { Card } from '@/types';
import {
  createStudySession,
  getCurrentCard,
  recordResult,
  moveToNext,
  isComplete,
  getProgress,
} from '@/lib/study/session';

export default function ReviewPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [autoNextTimer, setAutoNextTimer] = useState<NodeJS.Timeout | null>(null);
  const [isCardSubmitted, setIsCardSubmitted] = useState(false);

  useEffect(() => {
    loadReviewCards();
  }, []);

  useEffect(() => {
    return () => {
      if (autoNextTimer) {
        clearTimeout(autoNextTimer);
      }
    };
  }, [autoNextTimer]);

  const loadReviewCards = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/review');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load review cards');
      }
      const data = await response.json();
      if (!data.cards || data.cards.length === 0) {
        setCards([]);
        setSession(null);
        return;
      }
      setCards(data.cards);
      const newSession = createStudySession(data.cards);
      setSession(newSession);
    } catch (error) {
      console.error('Error loading review cards:', error);
      setCards([]);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (isCorrect: boolean) => {
    if (!session) return;

    const currentCard = getCurrentCard(session);
    if (!currentCard) return;

    recordResult(session, currentCard.id, isCorrect);
    setSession({ ...session });

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: currentCard.id,
          isCorrect,
        }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
    }

    const timer = setTimeout(() => {
      handleNext();
    }, 2500);

    setAutoNextTimer(timer);
  };

  const handleNext = () => {
    if (!session || !isCardSubmitted) return;

    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      setAutoNextTimer(null);
    }

    setIsCardSubmitted(false); // Reset for next card
    const hasMore = moveToNext(session);
    setSession({ ...session });

    if (!hasMore || isComplete(session)) {
      router.push('/complete?review=true');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">오답 카드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!session || cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">복습할 오답이 없습니다</h2>
          <p className="text-gray-600 mb-6">모든 문제를 정확히 학습하셨습니다!</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const currentCard = getCurrentCard(session);
  const progress = getProgress(session);

  if (!currentCard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            <span className="mr-2">←</span> 메인으로
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">오답 복습</h1>
          <ProgressBar current={progress.current} total={progress.total} />
        </div>

        <CardStudy 
          card={currentCard} 
          onAnswer={handleAnswer}
          onSubmitted={setIsCardSubmitted}
        />

        <div className="mt-6 text-center">
          <button
            onClick={handleNext}
            disabled={!isCardSubmitted}
            className={`font-semibold py-3 px-8 rounded-lg transition-colors ${
              isCardSubmitted
                ? 'bg-gray-600 hover:bg-gray-700 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            다음 카드
          </button>
        </div>
      </div>
    </div>
  );
}

