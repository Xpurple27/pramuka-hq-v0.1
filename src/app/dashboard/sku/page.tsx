import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getMembersAction } from '@/app/actions/members'
import SkuDashboardClient from './SkuDashboardClient'

export default async function SkuPage() {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get active Gugus Depan
  const gudepName = user.user_metadata?.school || 'Pangkalan Belum Diatur'

  // Fetch members to calculate SKU percentage
  const { data, error } = await getMembersAction(gudepName)
  const hasDatabaseError = !!error

  return (
    <SkuDashboardClient
      gudepName={gudepName}
      initialMembers={data}
      hasDatabaseError={hasDatabaseError}
    />
  )
}
