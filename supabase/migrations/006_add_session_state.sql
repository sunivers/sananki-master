-- Add session state fields to daily_sessions table
ALTER TABLE daily_sessions
ADD COLUMN IF NOT EXISTS card_ids JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS current_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_additional_study BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_sessions_date ON daily_sessions(date);
