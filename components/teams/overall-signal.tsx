'use client'

import { useTranslation } from '@/lib/i18n/context'

interface OverallSignalProps {
  pulseScore: number | null
  deltaScore: number | null
  pulseParticipation: number // percentage 0-100
  deltaSessions: number
}

export function OverallSignal({
  pulseScore,
  deltaScore,
  pulseParticipation,
  deltaSessions,
}: OverallSignalProps) {
  const t = useTranslation()

  // Calculate combined score (weighted average)
  // Pulse: 60% weight (daily signal), Delta: 40% weight (periodic deep dive)
  let combinedScore: number | null = null
  let scoreSource: 'both' | 'pulse' | 'delta' | 'none' = 'none'

  if (pulseScore !== null && deltaScore !== null) {
    combinedScore = pulseScore * 0.6 + deltaScore * 0.4
    scoreSource = 'both'
  } else if (pulseScore !== null) {
    combinedScore = pulseScore
    scoreSource = 'pulse'
  } else if (deltaScore !== null) {
    combinedScore = deltaScore
    scoreSource = 'delta'
  }

  // Determine health status
  const getHealthStatus = (score: number | null) => {
    if (score === null) return { label: t('signalNoData'), color: 'stone', icon: '○' }
    if (score >= 4) return { label: t('signalExcellent'), color: 'green', icon: '●' }
    if (score >= 3) return { label: t('signalGood'), color: 'cyan', icon: '●' }
    if (score >= 2) return { label: t('signalAttention'), color: 'amber', icon: '◐' }
    return { label: t('signalCritical'), color: 'red', icon: '○' }
  }

  const status = getHealthStatus(combinedScore)

  // Color mappings for Tailwind
  const colorMap = {
    green: {
      bg: 'bg-green-500',
      bgLight: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-400',
      ring: 'ring-green-500/20',
    },
    cyan: {
      bg: 'bg-cyan-500',
      bgLight: 'bg-cyan-50 dark:bg-cyan-900/20',
      border: 'border-cyan-200 dark:border-cyan-800',
      text: 'text-cyan-700 dark:text-cyan-400',
      ring: 'ring-cyan-500/20',
    },
    amber: {
      bg: 'bg-amber-500',
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-400',
      ring: 'ring-amber-500/20',
    },
    red: {
      bg: 'bg-red-500',
      bgLight: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-400',
      ring: 'ring-red-500/20',
    },
    stone: {
      bg: 'bg-stone-400 dark:bg-stone-600',
      bgLight: 'bg-stone-50 dark:bg-stone-800',
      border: 'border-stone-200 dark:border-stone-700',
      text: 'text-stone-500 dark:text-stone-400',
      ring: 'ring-stone-500/20',
    },
  }

  const colors = colorMap[status.color as keyof typeof colorMap]

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bgLight} p-4 sm:p-5`}>
      <div className="flex items-center gap-4">
        {/* Score circle */}
        <div className="relative">
          <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center ring-4 ${colors.ring}`}>
            {combinedScore !== null ? (
              <span className="text-2xl font-bold text-white">
                {combinedScore.toFixed(1)}
              </span>
            ) : (
              <span className="text-2xl text-white/60">—</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              {t('signalTitle')}
            </h3>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.bgLight} ${colors.text} ${colors.border} border`}>
              {status.label}
            </span>
          </div>

          {/* Source indicators */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {pulseScore !== null && (
              <div className="flex items-center gap-1.5">
                <span className="text-pink-500">♥</span>
                <span className="text-stone-600 dark:text-stone-400">
                  Pulse: {pulseScore.toFixed(1)}
                </span>
              </div>
            )}
            {deltaScore !== null && (
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-500 font-bold">Δ</span>
                <span className="text-stone-600 dark:text-stone-400">
                  Delta: {deltaScore.toFixed(1)}
                </span>
              </div>
            )}
            {scoreSource === 'none' && (
              <span className="text-stone-500 dark:text-stone-400">
                {t('signalCollectData')}
              </span>
            )}
          </div>

          {/* Data completeness hint */}
          {scoreSource !== 'both' && scoreSource !== 'none' && (
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
              {scoreSource === 'pulse' ? t('signalAddDelta') : t('signalAddPulse')}
            </p>
          )}
        </div>

        {/* Quick stats */}
        <div className="hidden sm:flex items-center gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {pulseParticipation}%
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">{t('signalParticipation')}</div>
          </div>
          <div className="w-px h-8 bg-stone-200 dark:bg-stone-700" />
          <div>
            <div className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {deltaSessions}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400">{t('sessions')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
