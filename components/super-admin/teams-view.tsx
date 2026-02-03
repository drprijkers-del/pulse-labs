'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

interface Props {
  accountsWithTeams: AccountWithTeams[]
  totalTeams: number
  activeAccounts: number
}

export function SuperAdminTeamsView({ accountsWithTeams, totalTeams, activeAccounts }: Props) {
  const router = useRouter()
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'with-teams' | 'no-teams'>('all')

  async function handleLogout() {
    await fetch('/api/auth/super-admin/logout', { method: 'POST' })
    router.push('/super-admin/login')
    router.refresh()
  }

  function toggleAccount(userId: string) {
    const newExpanded = new Set(expandedAccounts)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedAccounts(newExpanded)
  }

  function expandAll() {
    setExpandedAccounts(new Set(accountsWithTeams.map(a => a.user.id)))
  }

  function collapseAll() {
    setExpandedAccounts(new Set())
  }

  // Filter accounts
  const filteredAccounts = accountsWithTeams.filter(account => {
    if (filter === 'with-teams') return account.teams.length > 0
    if (filter === 'no-teams') return account.teams.length === 0
    return true
  })

  // Extract username from email
  const getUsername = (email: string) => email.split('@')[0]

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      {/* Header */}
      <header className="border-b border-stone-700 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/super-admin/dashboard" className="text-2xl hover:opacity-80 transition-opacity">
              🔐
            </Link>
            <div>
              <span className="font-bold text-lg">Teams by Account</span>
              <span className="text-stone-500 text-sm ml-2">Super Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/teams"
              className="px-3 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Teams
            </Link>
            <Link
              href="/super-admin/dashboard"
              className="px-4 py-2 text-sm text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-stone-800 border border-stone-700 rounded-xl p-4">
            <div className="text-3xl font-bold text-cyan-400">{totalTeams}</div>
            <div className="text-stone-400 text-sm">Total Teams</div>
          </div>
          <div className="bg-stone-800 border border-stone-700 rounded-xl p-4">
            <div className="text-3xl font-bold text-cyan-400">{activeAccounts}</div>
            <div className="text-stone-400 text-sm">Accounts with Teams</div>
          </div>
          <div className="bg-stone-800 border border-stone-700 rounded-xl p-4">
            <div className="text-3xl font-bold text-cyan-400">{accountsWithTeams.length}</div>
            <div className="text-stone-400 text-sm">Total Accounts</div>
          </div>
        </div>

        {/* Filters and actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-cyan-900 text-cyan-300'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              All ({accountsWithTeams.length})
            </button>
            <button
              onClick={() => setFilter('with-teams')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'with-teams'
                  ? 'bg-cyan-900 text-cyan-300'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              With Teams ({accountsWithTeams.filter(a => a.teams.length > 0).length})
            </button>
            <button
              onClick={() => setFilter('no-teams')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'no-teams'
                  ? 'bg-cyan-900 text-cyan-300'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              No Teams ({accountsWithTeams.filter(a => a.teams.length === 0).length})
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-3 py-1.5 text-sm bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1.5 text-sm bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Accounts list */}
        <div className="space-y-3">
          {filteredAccounts.map((account) => {
            const isExpanded = expandedAccounts.has(account.user.id)
            const hasTeams = account.teams.length > 0

            return (
              <div
                key={account.user.id}
                className="bg-stone-800 border border-stone-700 rounded-xl overflow-hidden"
              >
                {/* Account header */}
                <button
                  onClick={() => toggleAccount(account.user.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-stone-750 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {/* Expand/collapse icon */}
                    <svg
                      className={`w-5 h-5 text-stone-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>

                    {/* Account info */}
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <span className="text-lg">{getUsername(account.user.email)}</span>
                        <span className="text-stone-500 text-sm">({account.user.email})</span>
                        {account.user.role === 'super_admin' && (
                          <span className="text-xs bg-cyan-900 text-cyan-300 px-2 py-0.5 rounded-full">
                            super admin
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-stone-500 mt-0.5">
                        Joined {new Date(account.user.created_at).toLocaleDateString('nl-NL')}
                        {account.user.last_login_at && (
                          <span className="ml-2">
                            · Last login {new Date(account.user.last_login_at).toLocaleDateString('nl-NL')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Team count badge */}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    hasTeams
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-stone-700 text-stone-500'
                  }`}>
                    {account.teams.length} {account.teams.length === 1 ? 'team' : 'teams'}
                  </div>
                </button>

                {/* Teams list (expanded) */}
                {isExpanded && hasTeams && (
                  <div className="border-t border-stone-700 bg-stone-850">
                    <div className="p-2">
                      <table className="w-full">
                        <thead>
                          <tr className="text-xs text-stone-500 uppercase">
                            <th className="text-left px-3 py-2">Team Name</th>
                            <th className="text-center px-3 py-2">Size</th>
                            <th className="text-center px-3 py-2">Vibe Score</th>
                            <th className="text-center px-3 py-2">Sessions</th>
                            <th className="text-left px-3 py-2">Created</th>
                            <th className="text-right px-3 py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {account.teams.map((team) => (
                            <tr
                              key={team.id}
                              className="border-t border-stone-700/50 hover:bg-stone-800/50"
                            >
                              <td className="px-3 py-2">
                                <span className="font-medium text-white">{team.name}</span>
                              </td>
                              <td className="px-3 py-2 text-center text-stone-400">
                                {team.expected_team_size || '-'}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {team.pulse_avg_score ? (
                                  <span className={`font-medium ${
                                    team.pulse_avg_score >= 3.5 ? 'text-green-400' :
                                    team.pulse_avg_score >= 2.5 ? 'text-yellow-400' :
                                    'text-red-400'
                                  }`}>
                                    {team.pulse_avg_score.toFixed(1)}
                                  </span>
                                ) : (
                                  <span className="text-stone-500">-</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center text-stone-400">
                                {team.delta_total_sessions || 0}
                              </td>
                              <td className="px-3 py-2 text-stone-500 text-sm">
                                {new Date(team.created_at).toLocaleDateString('nl-NL')}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <Link
                                  href={`/teams/${team.id}`}
                                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                                >
                                  View →
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Empty state when expanded but no teams */}
                {isExpanded && !hasTeams && (
                  <div className="border-t border-stone-700 p-4 text-center text-stone-500 text-sm">
                    No teams created yet
                  </div>
                )}
              </div>
            )
          })}

          {filteredAccounts.length === 0 && (
            <div className="text-center text-stone-500 py-8">No accounts match the filter</div>
          )}
        </div>
      </main>
    </div>
  )
}
