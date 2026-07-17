import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import type { DashboardContext, Gudep } from '@/types/scouthub'

export async function getDashboardContext(): Promise<DashboardContext> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('gudep')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: true })

  const gudep = (data ?? []) as Gudep[]
  const cookieStore = await cookies()
  const selectedId = cookieStore.get('scouthub_active_gudep')?.value
  const activeGudep = gudep.find((item) => item.id === selectedId) ?? gudep[0] ?? null

  return {
    userId: user.id,
    email: user.email ?? '',
    fullName: user.user_metadata?.full_name ?? 'Pembina Pramuka',
    gudep,
    activeGudep,
  }
}

export async function getOwnedGudepId(requestedId?: string | null) {
  const context = await getDashboardContext()
  const id = requestedId || context.activeGudep?.id
  if (!id || !context.gudep.some((item) => item.id === id)) return null
  return id
}
