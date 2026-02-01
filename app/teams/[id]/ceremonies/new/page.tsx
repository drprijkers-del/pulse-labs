'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createSession, getTeamCeremonyLevel } from '@/domain/ceremonies/actions'
import { ANGLES, CeremonyAngle, CeremonyLevel, CEREMONY_LEVELS, getAnglesGroupedByLevel, isAngleUnlocked } from '@/domain/ceremonies/types'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'
import { AdminHeader } from '@/components/admin/header'

export default function NewCeremonySessionPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const t = useTranslation()
  const teamId = params.id as string

  // Pre-select angle from URL if provided (for repeat sessions)
  const preSelectedAngle = searchParams.get('angle') as CeremonyAngle | null
  const validAngles = ANGLES.map(a => a.id)
  const initialAngle = preSelectedAngle && validAngles.includes(preSelectedAngle) ? preSelectedAngle : null

  const [selectedAngle, setSelectedAngle] = useState<CeremonyAngle | null>(initialAngle)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teamLevel, setTeamLevel] = useState<CeremonyLevel>('shu')
  const [loadingLevel, setLoadingLevel] = useState(true)

  // Fetch team's ceremony level
  useEffect(() => {
    async function fetchLevel() {
      const level = await getTeamCeremonyLevel(teamId)
      setTeamLevel(level)
      setLoadingLevel(false)
    }
    fetchLevel()
  }, [teamId])

  async function handleSubmit() {
    if (!selectedAngle) return

    setLoading(true)
    setError(null)

    const result = await createSession(teamId, selectedAngle)

    if (!result.success) {
      setError(result.error || 'Failed to create session')
      setLoading(false)
      return
    }

    router.push(`/ceremonies/session/${result.sessionId}`)
  }

  // Map angle IDs to translation keys
  const getAngleLabel = (angleId: string) => {
    const labelMap: Record<string, string> = {
      scrum: t('angleScrum'),
      flow: t('angleFlow'),
      ownership: t('angleOwnership'),
      collaboration: t('angleCollaboration'),
      technical_excellence: t('angleTechnicalExcellence'),
      refinement: t('angleRefinement'),
      planning: t('anglePlanning'),
      retro: t('angleRetro'),
      demo: t('angleDemo'),
    }
    return labelMap[angleId] || angleId
  }

  const getAngleDesc = (angleId: string) => {
    const descMap: Record<string, string> = {
      scrum: t('angleScrumDesc'),
      flow: t('angleFlowDesc'),
      ownership: t('angleOwnershipDesc'),
      collaboration: t('angleCollaborationDesc'),
      technical_excellence: t('angleTechnicalExcellenceDesc'),
      refinement: t('angleRefinementDesc'),
      planning: t('anglePlanningDesc'),
      retro: t('angleRetroDesc'),
      demo: t('angleDemoDesc'),
    }
    return descMap[angleId] || ''
  }

  const anglesGrouped = getAnglesGroupedByLevel()

  // Level colors
  const levelColors = {
    shu: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      border: 'border-amber-300 dark:border-amber-700',
      text: 'text-amber-700 dark:text-amber-400',
      accent: 'bg-amber-500',
    },
    ha: {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      border: 'border-cyan-300 dark:border-cyan-700',
      text: 'text-cyan-700 dark:text-cyan-400',
      accent: 'bg-cyan-500',
    },
    ri: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-300 dark:border-purple-700',
      text: 'text-purple-700 dark:text-purple-400',
      accent: 'bg-purple-500',
    },
  }

  const levelOrder: CeremonyLevel[] = ['shu', 'ha', 'ri']
  const currentLevelIndex = levelOrder.indexOf(teamLevel)

  return (
    <>
      <AdminHeader />
      <main className="max-w-2xl mx-auto px-4 pt-8 pb-24">
        {/* Back link */}
        <Link
          href={`/teams/${teamId}?tab=ceremonies`}
          className="inline-flex items-center text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 mb-6 min-h-11 py-2"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('adminBack')}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('pickAngle')}</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">{t('justOne')}</p>
        </div>

        {/* Current Level Badge */}
        {!loadingLevel && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${levelColors[teamLevel].bg} ${levelColors[teamLevel].border} border mb-6`}>
            <span className={`text-lg font-bold ${levelColors[teamLevel].text}`}>
              {CEREMONY_LEVELS.find(l => l.id === teamLevel)?.kanji}
            </span>
            <span className={`text-sm font-medium ${levelColors[teamLevel].text}`}>
              {CEREMONY_LEVELS.find(l => l.id === teamLevel)?.label} Level
            </span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Angles organized by level */}
        <div className="space-y-8 mb-8">
          {levelOrder.map((level, levelIndex) => {
            const levelInfo = CEREMONY_LEVELS.find(l => l.id === level)!
            const angles = anglesGrouped[level]
            const isLevelUnlocked = levelIndex <= currentLevelIndex
            const colors = levelColors[level]

            return (
              <div key={level}>
                {/* Level Header */}
                <div className={`flex items-center gap-3 mb-3 ${!isLevelUnlocked ? 'opacity-50' : ''}`}>
                  <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center`}>
                    <span className={`text-xl font-bold ${colors.text}`}>{levelInfo.kanji}</span>
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${colors.text}`}>
                      {levelInfo.label}
                      {!isLevelUnlocked && (
                        <span className="ml-2 text-xs font-normal text-stone-400 dark:text-stone-500">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {levelInfo.subtitle}
                    </div>
                  </div>
                </div>

                {/* Angles for this level */}
                <div className="space-y-2 pl-2">
                  {angles.map(angle => {
                    const isUnlocked = isAngleUnlocked(angle.id, teamLevel)

                    return (
                      <button
                        key={angle.id}
                        onClick={() => isUnlocked && setSelectedAngle(angle.id)}
                        disabled={!isUnlocked || loading}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          !isUnlocked
                            ? 'border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/50 opacity-50 cursor-not-allowed'
                            : selectedAngle === angle.id
                            ? `${colors.border} ${colors.bg}`
                            : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 bg-white dark:bg-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                            !isUnlocked
                              ? 'bg-stone-300 dark:bg-stone-600'
                              : selectedAngle === angle.id
                              ? colors.accent
                              : 'bg-stone-300 dark:bg-stone-600'
                          }`}>
                            {isUnlocked ? getAngleLabel(angle.id).charAt(0) : '🔒'}
                          </div>
                          <div className="flex-1">
                            <div className={`font-semibold ${
                              !isUnlocked
                                ? 'text-stone-400 dark:text-stone-500'
                                : 'text-stone-900 dark:text-stone-100'
                            }`}>
                              {getAngleLabel(angle.id)}
                            </div>
                            <div className={`text-sm ${
                              !isUnlocked
                                ? 'text-stone-400 dark:text-stone-500'
                                : 'text-stone-500 dark:text-stone-400'
                            }`}>
                              {getAngleDesc(angle.id)}
                            </div>
                          </div>
                          {!isUnlocked && (
                            <div className="text-xs text-stone-400 dark:text-stone-500">
                              Reach {levelInfo.label}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link href={`/teams/${teamId}?tab=ceremonies`} className="flex-1">
            <Button type="button" variant="secondary" className="w-full">
              {t('cancel')}
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={!selectedAngle}
            loading={loading}
            className="flex-1"
          >
            {t('startSession')}
          </Button>
        </div>
      </main>
    </>
  )
}
