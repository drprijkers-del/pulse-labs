import { validateFeedbackToken } from '@/domain/feedback/actions'
import { FeedbackForm } from '@/components/feedback/feedback-form'
import { InvalidLink } from '@/components/team/invalid-link'

interface FeedbackPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ k?: string }>
}

export default async function FeedbackPage({ params, searchParams }: FeedbackPageProps) {
  const { slug } = await params
  const { k: token } = await searchParams

  if (!token) {
    return <InvalidLink message="Link mist verificatie token." />
  }

  const validation = await validateFeedbackToken(slug, token)

  if (!validation.valid || !validation.teamName || !validation.tokenHash) {
    return <InvalidLink message={validation.error || 'Link is niet geldig of verlopen.'} />
  }

  return (
    <FeedbackForm
      teamSlug={slug}
      teamName={validation.teamName}
      tokenHash={validation.tokenHash}
    />
  )
}
