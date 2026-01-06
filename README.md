# 산안기마스터

산업안전기사 필기 합격을 위한 마이크로 학습 웹앱

## 기능

- 기출 문장 카드 학습 (O/X, 빈칸, 단답형)
- 오늘의 학습 자동 생성 (30문장)
- 정답/오답 자동 기록 및 반복 학습
- 틀린 문제 자동 재등장
- 오답 전용 복습 기능

## 기술 스택

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **기타**: date-fns

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Supabase 데이터베이스 설정

1. Supabase 프로젝트를 생성합니다
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 파일의 내용을 실행합니다
3. 테이블과 인덱스가 생성되었는지 확인합니다

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
sananki-master/
├── app/
│   ├── api/              # API 라우트
│   ├── complete/         # 완료 페이지
│   ├── review/           # 오답 복습 페이지
│   ├── study/            # 학습 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx          # 메인 페이지
├── components/           # React 컴포넌트
│   ├── CardStudy.tsx     # 카드 학습 컴포넌트
│   ├── ProgressBar.tsx   # 진행 바
│   └── StatsDisplay.tsx  # 통계 표시
├── lib/
│   ├── db/               # 데이터베이스 함수
│   ├── study/            # 학습 로직
│   ├── supabase/         # Supabase 클라이언트
│   └── utils/            # 유틸리티 함수
├── types/                # TypeScript 타입 정의
└── supabase/
    └── migrations/       # 데이터베이스 마이그레이션
```

## 데이터 모델

### cards 테이블
- 카드 정보 (문제, 정답, 타입, 카테고리)

### card_progress 테이블
- 학습 진행 상태 (정답 연속 횟수, 마지막 결과, 다음 복습 날짜)

### daily_sessions 테이블
- 일일 학습 세션 추적

## 학습 로직

1. **오늘의 학습 생성**: 30개의 카드를 자동으로 선택
   - 복습 기한이 된 카드 우선
   - 새로운 카드
   - 랜덤 카드

2. **반복 학습**:
   - 틀린 카드: 당일 재등장, 다음날 자동 재등장
   - 맞은 카드: 간격 반복 알고리즘 적용 (1일, 3일, 7일, 14일, 30일...)

3. **자동 정답 체크**:
   - O/X: 버튼 클릭 시 즉시 체크
   - 빈칸/단답형: 입력 후 제출 시 자동 체크 (대소문자, 띄어쓰기 유연 처리)

## 카드 데이터 추가

Supabase 대시보드에서 `cards` 테이블에 직접 데이터를 추가하거나, SQL을 사용하여 일괄 추가할 수 있습니다.

```sql
INSERT INTO cards (category, question, answer, type, source)
VALUES 
  ('안전관리', '산업안전보건법의 목적은 근로자의 안전과 보건을 보호하는 것이다.', 'O', 'ox', '2024년 기출'),
  ('안전관리', '안전보건관리체계에서 최고경영자의 책임은 ___이다.', '법적 책임', 'blank', '2024년 기출');
```

## 라이선스

MIT
