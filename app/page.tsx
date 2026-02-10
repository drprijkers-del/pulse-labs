import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { HomeContent } from '@/components/home/home-content'

export default async function HomePage() {
  const { userId } = await auth()
  if (userId) redirect('/teams')
  return <HomeContent />
}
