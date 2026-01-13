/**
 * 한국 시간(KST, UTC+9) 기준 날짜/시간 유틸리티 함수
 * 새벽 2시를 기준으로 날짜를 구분합니다.
 */

/**
 * 한국 시간 기준 현재 Date 객체 반환
 */
export function getKSTDate(): Date {
  const now = new Date();
  // 한국 시간대(Asia/Seoul)로 변환
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
}

/**
 * 한국 시간 기준 현재 날짜/시간 반환
 */
export function getKSTDateTime(): Date {
  return getKSTDate();
}

/**
 * 한국 시간 기준 날짜 문자열 반환 (YYYY-MM-DD)
 * 새벽 2시를 기준으로 날짜를 구분합니다.
 */
export function getKSTDateString(): string {
  const now = new Date();
  // 한국 시간대의 현재 시간 정보 가져오기
  const kstDateStr = now.toLocaleString('en-US', { 
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // "MM/DD/YYYY, HH:MM:SS" 형식을 파싱
  const [datePart, timePart] = kstDateStr.split(', ');
  const [month, day, year] = datePart.split('/');
  const [hour] = timePart.split(':');
  
  const kstHour = parseInt(hour, 10);
  const kstDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  
  // 새벽 2시 이전이면 전날로 처리
  if (kstHour < 2) {
    kstDate.setDate(kstDate.getDate() - 1);
  }
  
  // YYYY-MM-DD 형식으로 반환
  const yearStr = kstDate.getFullYear();
  const monthStr = String(kstDate.getMonth() + 1).padStart(2, '0');
  const dayStr = String(kstDate.getDate()).padStart(2, '0');
  
  return `${yearStr}-${monthStr}-${dayStr}`;
}

/**
 * 한국 시간 기준 새벽 2시 이후인지 확인
 */
export function isAfterKSTReset(): boolean {
  const now = new Date();
  const kstHour = parseInt(
    now.toLocaleString('en-US', { 
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      hour12: false
    }),
    10
  );
  return kstHour >= 2;
}

/**
 * 한국 시간 기준 오늘 날짜의 새벽 2시 시각 반환
 */
export function getKSTResetTime(): Date {
  const now = new Date();
  const kstDateStr = now.toLocaleString('en-US', { 
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false
  });
  
  const [datePart, timePart] = kstDateStr.split(', ');
  const [month, day, year] = datePart.split('/');
  const kstHour = parseInt(timePart.split(':')[0], 10);
  
  const resetDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), 2, 0, 0);
  
  // 현재 시간이 새벽 2시 이전이면 전날 새벽 2시로 설정
  if (kstHour < 2) {
    resetDate.setDate(resetDate.getDate() - 1);
  }
  
  return resetDate;
}
