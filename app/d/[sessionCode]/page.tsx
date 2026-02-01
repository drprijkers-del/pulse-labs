import { validateSessionCode } from '@/domain/ceremonies/actions'
import { ParticipationContent } from '@/components/ceremonies/participation-content'
import { InvalidSession } from '@/components/ceremonies/invalid-session'

interface ParticipationPageProps {
  params: Promise<{ sessionCode: string }>
}

export default async function ParticipationPage({ params }: ParticipationPageProps) {
  const { sessionCode } = await params

  const validation = await validateSessionCode(sessionCode)

  if (!validation.valid || !validation.session) {
    return <InvalidSession />
  }

  return (
    <ParticipationContent
      sessionId={validation.session.id}
      teamName={validation.session.team_name}
      angle={validation.session.angle}
      title={validation.session.title}
      ceremonyLevel={validation.session.ceremony_level}
    />
  )
}
