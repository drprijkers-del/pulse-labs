'use client'

import Link from 'next/link'
import { TeamWithStats } from '@/domain/teams/actions'
import { AdminHeader } from '@/components/admin/header'
import { TeamActions } from '@/components/admin/team-actions'
import { ShareLinkSection } from '@/components/admin/share-link-section'
import { TeamStats } from '@/components/admin/team-stats'
import { useTranslation, useLanguage } from '@/lib/i18n/context'

interface TeamDetailContentProps {
  team: TeamWithStats
}

export function TeamDetailContent({ team }: TeamDetailContentProps) {
  const t = useTranslation()
  const { language } = useLanguage()

  const dateLocale = language === 'nl' ? 'nl-NL' : 'en-US'

  return (
    <div>
      <AdminHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/admin/teams"
          className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('adminBack')}
        </Link>

        {/* Team header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
              {team.description && (
                <p className="text-gray-500 mt-1">{team.description}</p>
              )}
              <p className="text-sm text-gray-400 mt-2">
                {t('adminCreatedOn')} {new Date(team.created_at).toLocaleDateString(dateLocale, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <TeamActions team={team} />
          </div>
        </div>

        <div className="grid gap-6">
          {/* Share link */}
          <ShareLinkSection teamId={team.id} teamSlug={team.slug} />

          {/* Stats */}
          <TeamStats team={team} />
        </div>
      </main>
    </div>
  )
}
