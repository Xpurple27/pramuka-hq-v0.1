import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getMemberSkuProgressAction } from '@/app/actions/sku'
import MemberSkuClient from './MemberSkuClient'

interface PageProps {
  params: Promise<{ memberId: string }>
}

export default async function MemberSkuPage({ params }: PageProps) {
  const { memberId } = await params
  const supabase = await createClient()

  // Verify auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const gudepName = user.user_metadata?.school || 'Pangkalan Belum Diatur'

  // Fetch member info from database
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('*')
    .eq('id', memberId)
    .eq('gudep_name', gudepName)
    .single()

  // Fetch member SKU progress
  const { data: progress, error: progressError } = await getMemberSkuProgressAction(memberId)

  const hasDatabaseError = !!memberError || !!progressError

  return (
    <MemberSkuClient
      memberId={memberId}
      gudepName={gudepName}
      initialMember={member || null}
      initialProgress={progress}
      hasDatabaseError={hasDatabaseError}
    />
  )
}
