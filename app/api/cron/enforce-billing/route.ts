import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Vercel Cron: enforce grace period expiry
 *
 * Runs daily. Finds users whose cancelled subscription grace period
 * has expired (billing_period_end < NOW) and downgrades them:
 * - subscription_tier → free
 * - billing_status → none
 * - All owned teams → plan='free', wow_level='shu'
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sets this automatically for cron jobs)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Find users with expired grace period
  const { data: expiredUsers, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('billing_status', 'cancelled')
    .lt('billing_period_end', new Date().toISOString())

  if (error) {
    console.error('[enforce-billing] Query error:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }

  if (!expiredUsers || expiredUsers.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let processed = 0

  for (const user of expiredUsers) {
    // Reset user to free tier
    await supabase
      .from('admin_users')
      .update({
        subscription_tier: 'free',
        billing_status: 'none',
      })
      .eq('id', user.id)

    // Downgrade all owned teams
    await supabase
      .from('teams')
      .update({ plan: 'free' })
      .eq('owner_id', user.id)

    // Reset Ha/Ri levels back to Shu
    await supabase
      .from('teams')
      .update({ wow_level: 'shu' })
      .eq('owner_id', user.id)
      .in('wow_level', ['ha', 'ri'])

    processed++
    console.log(`[enforce-billing] Downgraded user ${user.id} to free`)
  }

  return NextResponse.json({ processed })
}
