import Link from "next/link";
import { getTodayStats } from "@/lib/db/progress";
import StatsDisplay from "@/components/StatsDisplay";
import { isSupabaseConfigured } from "@/lib/utils/sample-data";

export default async function Home() {
  const isSampleMode = !isSupabaseConfigured();
  let stats;
  try {
    stats = await getTodayStats();
  } catch (error) {
    console.error("Error loading stats:", error);
    stats = {
      totalCards: 0,
      completedCards: 0,
      remainingCards: 0,
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Sample Mode Banner */}
          {isSampleMode && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
              <p className="font-semibold">샘플 모드로 실행 중</p>
              <p className="text-sm mt-1">
                Supabase 환경 변수가 설정되지 않아 샘플 데이터로 테스트 중입니다. 실제 데이터를
                사용하려면 .env.local 파일에 Supabase 설정을 추가하세요.
              </p>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">산안기마스터</h1>
            <p className="text-lg text-gray-600">산업안전기사 필기 합격을 위한 마이크로 학습</p>
          </div>

          {/* Stats */}
          <StatsDisplay
            totalCards={stats.totalCards}
            completedCards={stats.completedCards}
            remainingCards={stats.remainingCards}
          />

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="space-y-4">
              <Link
                href="/study"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-center text-lg transition-colors"
              >
                {stats.remainingCards > 0 ? "학습 시작" : "새로운 학습 시작"}
              </Link>
              {stats.completedCards > 0 && (
                <Link
                  href="/review"
                  className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg text-center text-lg transition-colors"
                >
                  오답 복습
                </Link>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">학습 방법</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>하루 30개의 카드를 학습합니다</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>정답을 제출하면 자동으로 채점됩니다</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>틀린 문제는 자동으로 반복 학습됩니다</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>맞춘 문제는 간격 반복으로 복습합니다</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
