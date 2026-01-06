/**
 * 정답 비교 유틸리티 함수
 * 대소문자, 띄어쓰기, 특수문자를 유연하게 처리
 */

export function normalizeAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // 여러 공백을 하나로
    .replace(/[.,;:!?]/g, '') // 구두점 제거
    .replace(/[()]/g, ''); // 괄호 제거
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  
  // 완전 일치
  if (normalizedUser === normalizedCorrect) {
    return true;
  }
  
  // 부분 일치 (빈칸 문제의 경우)
  if (normalizedCorrect.includes('___') || normalizedCorrect.includes('( )')) {
    // 빈칸 문제는 별도 처리
    return false;
  }
  
  // 숫자만 비교 (숫자 답안의 경우)
  const userNumber = extractNumber(normalizedUser);
  const correctNumber = extractNumber(normalizedCorrect);
  if (userNumber !== null && correctNumber !== null) {
    return userNumber === correctNumber;
  }
  
  return false;
}

function extractNumber(text: string): number | null {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export function checkBlankAnswer(
  userAnswer: string,
  correctAnswer: string,
  question: string
): boolean {
  // 빈칸 문제의 경우 정답 부분만 추출하여 비교
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  
  return normalizedUser === normalizedCorrect;
}

