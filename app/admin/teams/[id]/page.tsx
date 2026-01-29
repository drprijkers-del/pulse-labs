import { notFound } from 'next/navigation'
import { getTeam } from '@/domain/teams/actions'
import { requireAdmin } from '@/lib/auth/admin'
import { TeamDetailContent } from '@/components/admin/team-detail-content'

interface TeamDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  await requireAdmin()
  const { id } = await params
  const team = await getTeam(id)

  if (!team) {
    notFound()
  }

  return <TeamDetailContent team={team} />
}
