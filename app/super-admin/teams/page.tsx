import { requireSuperAdmin } from '@/lib/auth/super-admin'
import { createAdminClient } from '@/lib/supabase/server'
import { SuperAdminTeamsView } from '@/components/super-admin/teams-view'

interface AdminUser {
  id: string
  email: string
  role: 'super_admin' | 'scrum_master'
  created_at: string
  last_login_at: string | null
}

interface Team {
  id: string
  name: string
  slug: string
  owner_id: string
  created_at: string
  expected_team_size: number | null
  pulse_avg_score: number | null
  delta_total_sessions: number
}

interface AccountWithTeams {
  user: AdminUser
  teams: Team[]
}

async function getTeamsGroupedByAccount(): Promise<AccountWithTeams[]> {
  const supabase = await createAdminClient()

  // Fetch all admin users
  const { data: users, error: usersError } = await supabase
    .from('admin_users')
    .select('id, email, role, created_at, last_login_at')
    .order('created_at', { ascending: false })

  if (usersError || !users) {
    console.error('Error fetching admin users:', usersError)
    return []
  }

  // Fetch all teams with stats
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, slug, owner_id, created_at, expected_team_size, pulse_avg_score, delta_total_sessions')
    .order('created_at', { ascending: false })

  if (teamsError) {
    console.error('Error fetching teams:', teamsError)
  }

  const teamsData = teams || []

  // Group teams by owner
  const accountsWithTeams: AccountWithTeams[] = users.map(user => ({
    user: user as AdminUser,
    teams: (teamsData as Team[]).filter(team => team.owner_id === user.id)
  }))

  // Sort by team count (most teams first), then by last login
  accountsWithTeams.sort((a, b) => {
    if (b.teams.length !== a.teams.length) {
      return b.teams.length - a.teams.length
    }
    const aLogin = a.user.last_login_at ? new Date(a.user.last_login_at).getTime() : 0
    const bLogin = b.user.last_login_at ? new Date(b.user.last_login_at).getTime() : 0
    return bLogin - aLogin
  })

  return accountsWithTeams
}

export default async function SuperAdminTeamsPage() {
  await requireSuperAdmin()
  const accountsWithTeams = await getTeamsGroupedByAccount()

  const totalTeams = accountsWithTeams.reduce((sum, a) => sum + a.teams.length, 0)
  const activeAccounts = accountsWithTeams.filter(a => a.teams.length > 0).length

  return (
    <SuperAdminTeamsView
      accountsWithTeams={accountsWithTeams}
      totalTeams={totalTeams}
      activeAccounts={activeAccounts}
    />
  )
}
