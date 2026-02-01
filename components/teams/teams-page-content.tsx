'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { UnifiedTeam } from '@/domain/teams/actions'
import { BacklogItem, ReleaseNote } from '@/domain/backlog/actions'
import { TeamsListContent } from '@/components/teams/teams-list-content'
import { BacklogDisplay } from '@/components/backlog/backlog-display'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/i18n/context'

interface TeamsPageContentProps {
  teams: UnifiedTeam[]
  backlogItems: BacklogItem[]
  releases: ReleaseNote[]
}

type MainView = 'teams' | 'backlog'

export function TeamsPageContent({ teams, backlogItems, releases }: TeamsPageContentProps) {
  const t = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get view from URL, default to 'teams'
  const currentView = (searchParams.get('view') as MainView) || 'teams'

  const setView = (view: MainView) => {
    if (view === 'teams') {
      router.push('/teams')
    } else {
      router.push(`/teams?view=${view}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header with context */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
          {currentView === 'teams' ? t('teamsTitle') : t('backlogTab')}
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 max-w-2xl">
          {currentView === 'teams'
            ? t('teamsSubtitle')
            : 'What we\'re exploring, building, and have decided against.'
          }
        </p>
      </div>

      {/* View toggle + actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
          <button
            onClick={() => setView('teams')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === 'teams'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Teams
            {teams.length > 0 && (
              <span className="ml-1.5 text-xs text-stone-400 dark:text-stone-500">({teams.length})</span>
            )}
          </button>
          <button
            onClick={() => setView('backlog')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === 'backlog'
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Backlog
          </button>
        </div>

        {/* New Team button - only on Teams view */}
        {currentView === 'teams' && (
          <Link href="/teams/new" className="shrink-0">
            <Button className="w-full sm:w-auto">{t('teamsNewTeam')}</Button>
          </Link>
        )}
      </div>

      {/* View content */}
      {currentView === 'teams' && (
        <TeamsListContent teams={teams} />
      )}

      {currentView === 'backlog' && (
        <BacklogDisplay items={backlogItems} releases={releases} />
      )}
    </div>
  )
}
