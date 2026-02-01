/**
 * Ceremonies Types
 *
 * Core types for the Ceremonies intervention tool.
 */

// Available angles for Ceremonies sessions
export type CeremonyAngle =
  | 'scrum'
  | 'flow'
  | 'ownership'
  | 'collaboration'
  | 'technical_excellence'
  | 'refinement'
  | 'planning'
  | 'retro'
  | 'demo'

// Session lifecycle status
export type CeremonyStatus = 'draft' | 'active' | 'closed'

// A single statement that team members respond to
export interface Statement {
  id: string
  text: string
  angle: CeremonyAngle
}

// Team member's answers: statement_id -> score (1-5)
export type ResponseAnswers = Record<string, number>

// Ceremony session entity
export interface CeremonySession {
  id: string
  team_id: string
  session_code: string
  angle: CeremonyAngle
  title: string | null
  status: CeremonyStatus

  // Outcome (populated when closed)
  focus_area: string | null
  experiment: string | null
  experiment_owner: string | null
  followup_date: string | null  // ISO date string

  // Metadata
  created_by: string | null
  created_at: string
  closed_at: string | null
}

// Ceremony session with additional computed fields
export interface CeremonySessionWithStats extends CeremonySession {
  response_count: number
  team_name?: string
  overall_score?: number | null  // Average score (1-5), null if < 3 responses
}

// Individual response (anonymous)
export interface CeremonyResponse {
  id: string
  session_id: string
  answers: ResponseAnswers
  device_id: string
  created_at: string
}

// Score distribution (how many 1s, 2s, 3s, 4s, 5s)
export type ScoreDistribution = [number, number, number, number, number]

// Statement score after aggregation
export interface StatementScore {
  statement: Statement
  score: number              // Average score (1-5)
  response_count: number     // How many answered this statement
  distribution: ScoreDistribution  // [count of 1s, 2s, 3s, 4s, 5s]
  variance: number           // Standard deviation (0 = agreement, >1 = disagreement)
}

// Synthesis output
export interface SynthesisResult {
  strengths: StatementScore[]   // Top 2 highest scoring
  tensions: StatementScore[]    // Top 2 lowest scoring
  all_scores: StatementScore[]  // All statements, sorted by score (high to low)
  overall_score: number         // Average across all answers (1-5)
  disagreement_count: number    // How many statements have high variance
  focus_area: string            // Derived from lowest cluster
  suggested_experiment: string  // Rule-based suggestion
  response_count: number        // Total responses
}

// Angle metadata for UI
export interface AngleInfo {
  id: CeremonyAngle
  label: string
  description: string
  level: CeremonyLevel  // Required level to access this angle
}

// Angles organized by Shu-Ha-Ri level
// Shu (守): Learn the basics - standard ceremonies
// Ha (破): Adapt intentionally - team dynamics & process
// Ri (離): Mastery - advanced practices & self-organization

export const ANGLES: AngleInfo[] = [
  // ═══════════════════════════════════════════
  // SHU LEVEL (守) - Learn the basics
  // ═══════════════════════════════════════════
  {
    id: 'retro',
    label: 'Retro',
    description: 'Are we improving? Do actions lead to change?',
    level: 'shu'
  },
  {
    id: 'planning',
    label: 'Planning',
    description: 'Is commitment realistic? Is the Sprint Goal clear?',
    level: 'shu'
  },
  {
    id: 'scrum',
    label: 'Scrum',
    description: 'Are events useful? Is the framework helping?',
    level: 'shu'
  },

  // ═══════════════════════════════════════════
  // HA LEVEL (破) - Adapt intentionally
  // ═══════════════════════════════════════════
  {
    id: 'flow',
    label: 'Flow',
    description: 'Is work moving? Are we finishing what we start?',
    level: 'ha'
  },
  {
    id: 'collaboration',
    label: 'Collaboration',
    description: 'Are we working together? Is knowledge shared?',
    level: 'ha'
  },
  {
    id: 'refinement',
    label: 'Refinement',
    description: 'Are stories ready? Is the backlog actionable?',
    level: 'ha'
  },

  // ═══════════════════════════════════════════
  // RI LEVEL (離) - Mastery & own approach
  // ═══════════════════════════════════════════
  {
    id: 'ownership',
    label: 'Ownership',
    description: 'Does the team own it? Can we act without asking?',
    level: 'ri'
  },
  {
    id: 'technical_excellence',
    label: 'Technical Excellence',
    description: 'Is the code getting better? Are we building quality in?',
    level: 'ri'
  },
  {
    id: 'demo',
    label: 'Demo',
    description: 'Are stakeholders engaged? Is feedback valuable?',
    level: 'ri'
  }
]

// Get angles available for a specific level (includes all unlocked levels)
export function getAnglesForLevel(level: CeremonyLevel): AngleInfo[] {
  const levelOrder: CeremonyLevel[] = ['shu', 'ha', 'ri']
  const currentLevelIndex = levelOrder.indexOf(level)

  return ANGLES.filter(angle => {
    const angleLevelIndex = levelOrder.indexOf(angle.level)
    return angleLevelIndex <= currentLevelIndex
  })
}

// Get angles grouped by level for display
export function getAnglesGroupedByLevel(): Record<CeremonyLevel, AngleInfo[]> {
  return {
    shu: ANGLES.filter(a => a.level === 'shu'),
    ha: ANGLES.filter(a => a.level === 'ha'),
    ri: ANGLES.filter(a => a.level === 'ri'),
  }
}

// Check if an angle is unlocked for a given level
export function isAngleUnlocked(angle: CeremonyAngle, teamLevel: CeremonyLevel): boolean {
  const angleInfo = ANGLES.find(a => a.id === angle)
  if (!angleInfo) return false

  const levelOrder: CeremonyLevel[] = ['shu', 'ha', 'ri']
  const teamLevelIndex = levelOrder.indexOf(teamLevel)
  const angleLevelIndex = levelOrder.indexOf(angleInfo.level)

  return angleLevelIndex <= teamLevelIndex
}

// Helper to get angle info
export function getAngleInfo(angle: CeremonyAngle): AngleInfo {
  return ANGLES.find(a => a.id === angle) || ANGLES[0]
}

// ============================================
// SHU-HA-RI LEVELS
// ============================================

// Ceremony progression levels (守破離)
export type CeremonyLevel = 'shu' | 'ha' | 'ri'

// Risk states (advisory only, no regression)
export type CeremonyRiskState = 'none' | 'slipping' | 'low_participation' | 'stale'

// Level metadata with Japanese characters
export interface LevelInfo {
  id: CeremonyLevel
  kanji: string
  label: string
  subtitle: string
  description: string
  questionDepth: string
}

// Level configuration
export const CEREMONY_LEVELS: LevelInfo[] = [
  {
    id: 'shu',
    kanji: '守',
    label: 'Shu',
    subtitle: 'Learn the basics',
    description: 'Follow the structure. Build the habit. Trust the process.',
    questionDepth: 'Basics'
  },
  {
    id: 'ha',
    kanji: '破',
    label: 'Ha',
    subtitle: 'Adapt intentionally',
    description: 'Question the rules. Experiment safely. Find what works for your team.',
    questionDepth: 'Adaptive'
  },
  {
    id: 'ri',
    kanji: '離',
    label: 'Ri',
    subtitle: 'Mastery & own approach',
    description: 'Transcend the framework. Create your own process. Lead by example.',
    questionDepth: 'Mastery'
  }
]

// Helper to get level info
export function getLevelInfo(level: CeremonyLevel): LevelInfo {
  return CEREMONY_LEVELS.find(l => l.id === level) || CEREMONY_LEVELS[0]
}

// Unlock requirements for UI display
export interface UnlockRequirement {
  key: string
  label: string
  met: boolean
  current?: number | string
  required?: number | string
}

// Progress toward next level
export interface LevelProgress {
  sessions_30d: number
  sessions_45d: number
  sessions_total: number
  followups_count: number
  unique_angles: number
  last_2_avg_score: number | null
  last_3_avg_score: number | null
  last_2_participation: number | null
  last_3_participation: number | null
  days_since_last_session: number | null
  can_unlock_ha: boolean
  can_unlock_ri: boolean
}

// Risk information
export interface LevelRisk {
  state: CeremonyRiskState
  reason: string | null
}

// Full level evaluation result
export interface LevelEvaluation {
  level: CeremonyLevel
  previous_level: CeremonyLevel
  level_changed: boolean
  risk: LevelRisk
  progress: LevelProgress
}

// Get unlock requirements for display
export function getUnlockRequirements(
  currentLevel: CeremonyLevel,
  progress: LevelProgress
): UnlockRequirement[] {
  if (currentLevel === 'shu') {
    // Requirements for Shu -> Ha
    return [
      {
        key: 'sessions',
        label: '3 sessions in 30 days',
        met: progress.sessions_30d >= 3,
        current: progress.sessions_30d,
        required: 3
      },
      {
        key: 'score',
        label: 'Avg score ≥ 3.2',
        met: (progress.last_2_avg_score || 0) >= 3.2,
        current: progress.last_2_avg_score?.toFixed(1) || '—',
        required: '3.2'
      },
      {
        key: 'participation',
        label: 'Participation ≥ 60%',
        met: (progress.last_2_participation || 0) >= 0.60,
        current: progress.last_2_participation
          ? `${Math.round(progress.last_2_participation * 100)}%`
          : '—',
        required: '60%'
      }
    ]
  } else if (currentLevel === 'ha') {
    // Requirements for Ha -> Ri
    return [
      {
        key: 'total_sessions',
        label: '6 total sessions',
        met: progress.sessions_total >= 6,
        current: progress.sessions_total,
        required: 6
      },
      {
        key: 'diversity',
        label: '3 different ceremony types',
        met: progress.unique_angles >= 3,
        current: progress.unique_angles,
        required: 3
      },
      {
        key: 'followups',
        label: '4 sessions with follow-up',
        met: progress.followups_count >= 4,
        current: progress.followups_count,
        required: 4
      },
      {
        key: 'recency',
        label: '3 sessions in 45 days',
        met: progress.sessions_45d >= 3,
        current: progress.sessions_45d,
        required: 3
      },
      {
        key: 'score',
        label: 'Avg score ≥ 3.5',
        met: (progress.last_3_avg_score || 0) >= 3.5,
        current: progress.last_3_avg_score?.toFixed(1) || '—',
        required: '3.5'
      },
      {
        key: 'participation',
        label: 'Participation ≥ 70%',
        met: (progress.last_3_participation || 0) >= 0.70,
        current: progress.last_3_participation
          ? `${Math.round(progress.last_3_participation * 100)}%`
          : '—',
        required: '70%'
      }
    ]
  }

  // Ri level - no more requirements
  return []
}
