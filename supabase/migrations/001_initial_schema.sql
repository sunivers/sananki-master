-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  choices JSONB NOT NULL, -- 선택지 배열 (4개)
  explanation TEXT, -- 해설
  type TEXT NOT NULL CHECK (type IN ('multiple_choice')),
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_progress table
CREATE TABLE IF NOT EXISTS card_progress (
  id BIGSERIAL PRIMARY KEY,
  card_id BIGINT REFERENCES cards(id) ON DELETE CASCADE,
  correct_streak INTEGER DEFAULT 0,
  last_result TEXT CHECK (last_result IN ('correct', 'incorrect')),
  last_studied_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(card_id)
);

-- Create daily_sessions table
CREATE TABLE IF NOT EXISTS daily_sessions (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_cards INTEGER DEFAULT 0,
  completed_cards INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_card_progress_next_review ON card_progress(next_review_at);
CREATE INDEX IF NOT EXISTS idx_card_progress_card_id ON card_progress(card_id);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(type);
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);

-- Enable Row Level Security (initially permissive for development)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for single-user app)
CREATE POLICY "Allow all operations on cards" ON cards
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on card_progress" ON card_progress
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on daily_sessions" ON daily_sessions
  FOR ALL USING (true) WITH CHECK (true);

