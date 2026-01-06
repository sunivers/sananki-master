'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/types';
import { checkAnswer, checkBlankAnswer } from '@/lib/utils/answer-check';

interface CardStudyProps {
  card: Card;
  onAnswer: (isCorrect: boolean) => void;
  onSubmitted?: (isSubmitted: boolean) => void;
  showAnswer?: boolean;
}

export default function CardStudy({ card, onAnswer, onSubmitted, showAnswer = false }: CardStudyProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Reset when card changes
    setUserAnswer('');
    setIsSubmitted(false);
    setIsCorrect(null);
    setShowResult(false);
    setIsFlipped(false);
    onSubmitted?.(false);
  }, [card.id, onSubmitted]);

  const handleSubmit = () => {
    if (!userAnswer.trim() && card.type !== 'ox') {
      return;
    }

    let correct = false;

    if (card.type === 'ox') {
      // O/X 타입은 이미 버튼 클릭으로 처리됨
      return;
    } else if (card.type === 'blank') {
      correct = checkBlankAnswer(userAnswer, card.answer, card.question);
    } else {
      // short (단답형)
      correct = checkAnswer(userAnswer, card.answer);
    }

    setIsCorrect(correct);
    setIsSubmitted(true);
    setIsFlipped(true);
    setShowResult(true);
    onSubmitted?.(true);
    onAnswer(correct);
  };

  const handleOXClick = (selected: 'O' | 'X') => {
    const correct = card.answer.trim().toUpperCase() === selected;
    setIsCorrect(correct);
    setIsSubmitted(true);
    setIsFlipped(true);
    setShowResult(true);
    onSubmitted?.(true);
    onAnswer(correct);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitted) {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`bg-white rounded-lg shadow-lg p-6 md:p-8 transition-all duration-300 ${
          showResult
            ? isCorrect
              ? 'border-4 border-green-500 scale-105'
              : 'border-4 border-red-500 scale-105'
            : 'border-2 border-gray-200'
        }`}
      >
        {/* Question */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">{card.category}</div>
          <div className="text-lg md:text-xl font-semibold text-gray-800 whitespace-pre-wrap">
            {card.question}
          </div>
        </div>

        {/* Answer Input/Display */}
        {card.type === 'ox' ? (
          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={() => handleOXClick('O')}
              disabled={isSubmitted}
              className={`px-8 py-4 text-2xl font-bold rounded-lg transition-all ${
                isSubmitted && isCorrect && card.answer.trim().toUpperCase() === 'O'
                  ? 'bg-green-500 text-white'
                  : isSubmitted && !isCorrect && card.answer.trim().toUpperCase() === 'O'
                  ? 'bg-red-500 text-white'
                  : isSubmitted
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
              }`}
            >
              O
            </button>
            <button
              onClick={() => handleOXClick('X')}
              disabled={isSubmitted}
              className={`px-8 py-4 text-2xl font-bold rounded-lg transition-all ${
                isSubmitted && isCorrect && card.answer.trim().toUpperCase() === 'X'
                  ? 'bg-green-500 text-white'
                  : isSubmitted && !isCorrect && card.answer.trim().toUpperCase() === 'X'
                  ? 'bg-red-500 text-white'
                  : isSubmitted
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white cursor-pointer'
              }`}
            >
              X
            </button>
          </div>
        ) : card.type === 'blank' ? (
          <div className="mb-6">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitted}
              placeholder="정답을 입력하세요"
              className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 ${
                isSubmitted
                  ? isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {!isSubmitted && (
              <button
                onClick={handleSubmit}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                제출
              </button>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSubmitted}
              placeholder="답을 입력하세요"
              className={`w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 ${
                isSubmitted
                  ? isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {!isSubmitted && (
              <button
                onClick={handleSubmit}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                제출
              </button>
            )}
          </div>
        )}

        {/* Result Display */}
        {showResult && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <span className="text-2xl">✓</span>
                  <span className="text-lg font-semibold text-green-700">정답입니다!</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">✗</span>
                  <span className="text-lg font-semibold text-red-700">오답입니다</span>
                </>
              )}
            </div>
            {!isCorrect && (
              <div className="text-gray-700 mt-2">
                <div className="font-medium">정답:</div>
                <div className="text-lg">{card.answer}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

