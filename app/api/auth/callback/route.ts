import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(new URL('/admin/login?error=auth_failed', request.url))
    }

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!adminUser) {
        // Not an admin - sign them out and redirect with error
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
      }
    }
  }

  // Redirect to teams page on success
  return NextResponse.redirect(new URL('/admin/teams', request.url))
}
