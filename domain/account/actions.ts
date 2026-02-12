'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function updateAccountName(firstName: string): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Not authenticated' }

  try {
    const client = await clerkClient()
    await client.users.updateUser(userId, { firstName })
    return { success: true }
  } catch {
    return { error: 'Could not update name' }
  }
}

export async function updateAccountEmail(newEmail: string): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Not authenticated' }

  const trimmed = newEmail.trim().toLowerCase()
  if (!trimmed || !trimmed.includes('@')) return { error: 'Invalid email' }

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    // Create new email address (verified — admin operation, user is authenticated)
    const newAddr = await client.emailAddresses.createEmailAddress({
      userId,
      emailAddress: trimmed,
      verified: true,
      primary: true,
    })

    // Remove old email addresses
    for (const addr of user.emailAddresses) {
      if (addr.id !== newAddr.id) {
        try {
          await client.emailAddresses.deleteEmailAddress(addr.id)
        } catch {
          // Old address cleanup is best-effort
        }
      }
    }

    // Sync to Supabase
    const supabase = await createAdminClient()
    await supabase
      .from('admin_users')
      .update({ email: trimmed })
      .eq('clerk_user_id', userId)

    return { success: true }
  } catch {
    return { error: 'Could not update email. The address may already be in use.' }
  }
}

export async function deleteAccount(): Promise<{ success?: boolean; error?: string }> {
  const { userId } = await auth()
  if (!userId) return { error: 'Not authenticated' }

  try {
    const supabase = await createAdminClient()

    // Find admin user
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (adminUser) {
      // Delete all teams owned by this user (cascades to team data via RLS/triggers)
      await supabase.from('teams').delete().eq('owner_id', adminUser.id)
      // Delete admin user record
      await supabase.from('admin_users').delete().eq('id', adminUser.id)
    }

    // Delete Clerk user
    const client = await clerkClient()
    await client.users.deleteUser(userId)

    return { success: true }
  } catch {
    return { error: 'Could not delete account' }
  }
}
