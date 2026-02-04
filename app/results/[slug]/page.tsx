import { redirect } from 'next/navigation'
import { getTeamContext } from '@/lib/tenant/context'
import { getAdminUser } from '@/lib/auth/admin'
import { createClient } from '@/lib/supabase/server'
import { TeamResultsView } from '@/components/team/team-results-view'
import { InvalidLink } from '@/components/team/invalid-link'

interface ResultsPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ k?: string; error?: string }>
}

export default async function ResultsPage({ params, searchParams }: ResultsPageProps) {
  const { slug } = await params
  const { k: token, error } = await searchParams

  // If token is provided, redirect to API route to set cookies
  if (token) {
    redirect(`/api/auth/team?slug=${slug}&k=${token}&redirect=results`)
  }

  // Show error if redirected with error
  if (error === 'invalid') {
    return <InvalidLink message="Deze link is niet geldig of verlopen." />
  }

  // Get team context from cookie (team member flow)
  const context = await getTeamContext()

  if (context && context.teamSlug === slug) {
    return <TeamResultsView teamName={context.teamName} teamSlug={context.teamSlug} />
  }

  // Fallback: check if user is a logged-in admin with access to this team
  const adminUser = await getAdminUser()
  if (adminUser) {
    const supabase = await createClient()
    let query = supabase.from('teams').select('id, name, slug').eq('slug', slug)
    if (adminUser.role !== 'super_admin') {
      query = query.eq('owner_id', adminUser.id)
    }
    const { data: team } = await query.single()

    if (team) {
      return <TeamResultsView teamName={team.name} teamSlug={team.slug} teamId={team.id} />
    }
  }

  return <InvalidLink message="Je hebt geen toegang tot deze resultaten. Gebruik de uitnodigingslink." />
}
