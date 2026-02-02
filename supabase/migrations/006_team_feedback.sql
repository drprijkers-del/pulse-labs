-- ============================================
-- MIGRATION 006: Team Feedback
-- ============================================
-- Anonymous feedback collection via shareable links
-- Simple structure: prompt + response, no scoring

-- Create team_feedback table
CREATE TABLE IF NOT EXISTS team_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  prompt_key TEXT NOT NULL,  -- e.g., 'working_well', 'could_improve', 'other'
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create feedback_links table for shareable anonymous links
CREATE TABLE IF NOT EXISTS feedback_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_feedback_team_id ON team_feedback(team_id);
CREATE INDEX IF NOT EXISTS idx_team_feedback_created_at ON team_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_links_team_id ON feedback_links(team_id);
CREATE INDEX IF NOT EXISTS idx_feedback_links_token_hash ON feedback_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_feedback_links_active ON feedback_links(team_id, is_active) WHERE is_active = true;

-- RLS policies
ALTER TABLE team_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback (anonymous)
CREATE POLICY "Anyone can submit feedback" ON team_feedback
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role full access on team_feedback" ON team_feedback
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow authenticated users to read feedback for their teams
CREATE POLICY "Admins can read team feedback" ON team_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = team_feedback.team_id
      AND t.owner_id = auth.uid()
    )
  );

-- Feedback links policies
CREATE POLICY "Anyone can read active feedback links" ON feedback_links
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Admins can manage feedback links" ON feedback_links
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = feedback_links.team_id
      AND t.owner_id = auth.uid()
    )
  );

-- Allow service role full access (for admin operations)
CREATE POLICY "Service role full access on feedback_links" ON feedback_links
  FOR ALL TO service_role USING (true) WITH CHECK (true);
