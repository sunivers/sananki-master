'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isReview, setIsReview] = useState(false);

  useEffect(() => {
    const incorrect = searchParams.get('incorrect');
    const review = searchParams.get('review');
    if (incorrect) {
      setIncorrectCount(parseInt(incorrect, 10));
    }
    if (review === 'true') {
      setIsReview(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isReview ? '복습 완료!' : '학습 완료!'}
          </h1>
          <p className="text-gray-600">
            {isReview
              ? '오답 복습을 모두 마쳤습니다.'
              : '오늘의 학습을 완료하셨습니다.'}
          </p>
        </div>

        {!isReview && incorrectCount > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-orange-800">
              <span className="font-bold">{incorrectCount}개</span>의 문제를 틀리셨습니다.
            </p>
            <p className="text-sm text-orange-600 mt-2">
              오답 복습을 통해 다시 학습해보세요!
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            메인으로 돌아가기
          </button>
          {!isReview && incorrectCount > 0 && (
            <button
              onClick={() => router.push('/review')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              오답 복습하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <CompleteContent />
    </Suspense>
  );
}

