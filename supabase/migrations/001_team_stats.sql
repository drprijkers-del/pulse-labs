-- ============================================
-- TEAM STATS DENORMALIZATION
-- Adds cached stats to teams table for fast reads
-- ============================================

-- Add stats columns to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS pulse_participant_count INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS pulse_today_entries INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS pulse_avg_score NUMERIC(3,2) DEFAULT NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS pulse_prev_avg_score NUMERIC(3,2) DEFAULT NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS pulse_stats_updated_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE teams ADD COLUMN IF NOT EXISTS delta_total_sessions INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS delta_active_sessions INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS delta_closed_sessions INTEGER DEFAULT 0;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS delta_avg_score NUMERIC(3,2) DEFAULT NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS delta_prev_avg_score NUMERIC(3,2) DEFAULT NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS delta_last_session_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS delta_stats_updated_at TIMESTAMPTZ DEFAULT NULL;

-- Index for needs_attention queries
CREATE INDEX IF NOT EXISTS idx_teams_pulse_avg_score ON teams(pulse_avg_score);
CREATE INDEX IF NOT EXISTS idx_teams_delta_avg_score ON teams(delta_avg_score);

-- ============================================
-- FUNCTION: Refresh Pulse Stats for a Team
-- ============================================
CREATE OR REPLACE FUNCTION refresh_team_pulse_stats(p_team_id UUID)
RETURNS VOID AS $$
DECLARE
  v_participant_count INTEGER;
  v_today_entries INTEGER;
  v_avg_score NUMERIC(3,2);
  v_prev_avg_score NUMERIC(3,2);
  v_seven_days_ago DATE;
  v_fourteen_days_ago DATE;
BEGIN
  v_seven_days_ago := CURRENT_DATE - INTERVAL '7 days';
  v_fourteen_days_ago := CURRENT_DATE - INTERVAL '14 days';

  -- Count participants
  SELECT COUNT(DISTINCT id) INTO v_participant_count
  FROM participants
  WHERE team_id = p_team_id;

  -- Count today's entries
  SELECT COUNT(*) INTO v_today_entries
  FROM mood_entries
  WHERE team_id = p_team_id AND entry_date = CURRENT_DATE;

  -- Calculate 7-day average
  SELECT ROUND(AVG(mood)::NUMERIC, 2) INTO v_avg_score
  FROM mood_entries
  WHERE team_id = p_team_id
    AND entry_date >= v_seven_days_ago;

  -- Calculate previous 7-day average (day 8-14)
  SELECT ROUND(AVG(mood)::NUMERIC, 2) INTO v_prev_avg_score
  FROM mood_entries
  WHERE team_id = p_team_id
    AND entry_date >= v_fourteen_days_ago
    AND entry_date < v_seven_days_ago;

  -- Update team stats
  UPDATE teams SET
    pulse_participant_count = COALESCE(v_participant_count, 0),
    pulse_today_entries = COALESCE(v_today_entries, 0),
    pulse_avg_score = v_avg_score,
    pulse_prev_avg_score = v_prev_avg_score,
    pulse_stats_updated_at = NOW()
  WHERE id = p_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Refresh Delta Stats for a Team
-- ============================================
CREATE OR REPLACE FUNCTION refresh_team_delta_stats(p_team_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_sessions INTEGER;
  v_active_sessions INTEGER;
  v_closed_sessions INTEGER;
  v_avg_score NUMERIC(3,2);
  v_prev_avg_score NUMERIC(3,2);
  v_last_session_at TIMESTAMPTZ;
  v_closed_session_ids UUID[];
  v_recent_ids UUID[];
  v_older_ids UUID[];
BEGIN
  -- Count sessions
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    COUNT(*) FILTER (WHERE status = 'closed')
  INTO v_total_sessions, v_active_sessions, v_closed_sessions
  FROM delta_sessions
  WHERE team_id = p_team_id;

  -- Get last session date
  SELECT MAX(created_at) INTO v_last_session_at
  FROM delta_sessions
  WHERE team_id = p_team_id;

  -- Get closed session IDs ordered by date (newest first)
  SELECT ARRAY_AGG(id ORDER BY created_at DESC) INTO v_closed_session_ids
  FROM delta_sessions
  WHERE team_id = p_team_id AND status = 'closed';

  -- Calculate overall average score from all closed sessions
  IF v_closed_session_ids IS NOT NULL AND array_length(v_closed_session_ids, 1) > 0 THEN
    SELECT ROUND(AVG(score)::NUMERIC, 2) INTO v_avg_score
    FROM (
      SELECT unnest(array_agg(value::INTEGER)) as score
      FROM delta_responses r, jsonb_each_text(r.answers::jsonb)
      WHERE r.session_id = ANY(v_closed_session_ids)
        AND value ~ '^[1-5]$'
    ) scores;

    -- Calculate trend: compare recent vs older sessions
    IF array_length(v_closed_session_ids, 1) >= 4 THEN
      v_recent_ids := v_closed_session_ids[1:2];
      v_older_ids := v_closed_session_ids[3:4];
    ELSIF array_length(v_closed_session_ids, 1) >= 2 THEN
      v_recent_ids := ARRAY[v_closed_session_ids[1]];
      v_older_ids := ARRAY[v_closed_session_ids[array_length(v_closed_session_ids, 1)]];
    END IF;

    -- Calculate prev avg score for trend
    IF v_older_ids IS NOT NULL AND array_length(v_older_ids, 1) > 0 THEN
      SELECT ROUND(AVG(score)::NUMERIC, 2) INTO v_prev_avg_score
      FROM (
        SELECT unnest(array_agg(value::INTEGER)) as score
        FROM delta_responses r, jsonb_each_text(r.answers::jsonb)
        WHERE r.session_id = ANY(v_older_ids)
          AND value ~ '^[1-5]$'
      ) scores;
    END IF;
  END IF;

  -- Update team stats
  UPDATE teams SET
    delta_total_sessions = COALESCE(v_total_sessions, 0),
    delta_active_sessions = COALESCE(v_active_sessions, 0),
    delta_closed_sessions = COALESCE(v_closed_sessions, 0),
    delta_avg_score = v_avg_score,
    delta_prev_avg_score = v_prev_avg_score,
    delta_last_session_at = v_last_session_at,
    delta_stats_updated_at = NOW()
  WHERE id = p_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Refresh All Stats for a Team
-- ============================================
CREATE OR REPLACE FUNCTION refresh_team_stats(p_team_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM refresh_team_pulse_stats(p_team_id);
  PERFORM refresh_team_delta_stats(p_team_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS: Auto-refresh stats on data changes
-- ============================================

-- Trigger function for mood_entries
CREATE OR REPLACE FUNCTION trigger_refresh_pulse_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM refresh_team_pulse_stats(OLD.team_id);
    RETURN OLD;
  ELSE
    PERFORM refresh_team_pulse_stats(NEW.team_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for participants
CREATE OR REPLACE FUNCTION trigger_refresh_participant_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM refresh_team_pulse_stats(OLD.team_id);
    RETURN OLD;
  ELSE
    PERFORM refresh_team_pulse_stats(NEW.team_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for delta_sessions
CREATE OR REPLACE FUNCTION trigger_refresh_delta_stats_session()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM refresh_team_delta_stats(OLD.team_id);
    RETURN OLD;
  ELSE
    PERFORM refresh_team_delta_stats(NEW.team_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for delta_responses
CREATE OR REPLACE FUNCTION trigger_refresh_delta_stats_response()
RETURNS TRIGGER AS $$
DECLARE
  v_team_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT team_id INTO v_team_id FROM delta_sessions WHERE id = OLD.session_id;
  ELSE
    SELECT team_id INTO v_team_id FROM delta_sessions WHERE id = NEW.session_id;
  END IF;

  IF v_team_id IS NOT NULL THEN
    PERFORM refresh_team_delta_stats(v_team_id);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS mood_entries_refresh_stats ON mood_entries;
DROP TRIGGER IF EXISTS participants_refresh_stats ON participants;
DROP TRIGGER IF EXISTS delta_sessions_refresh_stats ON delta_sessions;
DROP TRIGGER IF EXISTS delta_responses_refresh_stats ON delta_responses;

-- Create triggers
CREATE TRIGGER mood_entries_refresh_stats
  AFTER INSERT OR UPDATE OR DELETE ON mood_entries
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_pulse_stats();

CREATE TRIGGER participants_refresh_stats
  AFTER INSERT OR UPDATE OR DELETE ON participants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_participant_stats();

CREATE TRIGGER delta_sessions_refresh_stats
  AFTER INSERT OR UPDATE OR DELETE ON delta_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_delta_stats_session();

CREATE TRIGGER delta_responses_refresh_stats
  AFTER INSERT OR UPDATE OR DELETE ON delta_responses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_refresh_delta_stats_response();

-- ============================================
-- INITIAL POPULATION: Refresh all team stats
-- ============================================
DO $$
DECLARE
  team_record RECORD;
BEGIN
  FOR team_record IN SELECT id FROM teams LOOP
    PERFORM refresh_team_stats(team_record.id);
  END LOOP;
END $$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION refresh_team_pulse_stats TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_team_delta_stats TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_team_stats TO authenticated;
