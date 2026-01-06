interface StatsDisplayProps {
  totalCards: number;
  completedCards: number;
  remainingCards: number;
}

export default function StatsDisplay({
  totalCards,
  completedCards,
  remainingCards,
}: StatsDisplayProps) {
  const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">오늘의 학습 현황</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{totalCards}</div>
          <div className="text-sm text-gray-600 mt-1">전체 카드</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{completedCards}</div>
          <div className="text-sm text-gray-600 mt-1">완료</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">{remainingCards}</div>
          <div className="text-sm text-gray-600 mt-1">남은 카드</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>진행률</span>
          <span>{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

