import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getMembersAction } from '@/app/actions/members'
import MemberManagementClient from './MemberManagementClient'

export default async function MembersPage() {
  const supabase = await createClient()
  
  // Verify user authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Retrieve active Gugus Depan (Gudep)
  const gudepName = user.user_metadata?.school || 'Pangkalan Belum Diatur'

  // Fetch initial members
  const { data, error } = await getMembersAction(gudepName)
  const hasDatabaseError = !!error

  return (
    <MemberManagementClient
      gudepName={gudepName}
      initialMembers={data}
      hasDatabaseError={hasDatabaseError}
    />
  )
}
