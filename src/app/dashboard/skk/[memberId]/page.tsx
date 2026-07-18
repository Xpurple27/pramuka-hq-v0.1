import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import SkkProgressManager from '@/components/dashboard/skk-progress-manager'
import { getDashboardContext } from '@/lib/scouthub-context'
import { createClient } from '@/utils/supabase/server'
import { firstRelated } from '@/lib/relations'
import type { MemberSkkProgress, SkkItem } from '@/types/scouthub'

export default async function MemberSkkPage({ params }: { params: Promise<{ memberId: string }> }) {
  const context = await getDashboardContext()
  if (!context.activeGudep) notFound()
  const { memberId } = await params
  const supabase = await createClient()
  const { data: member } = await supabase.from('members').select('id,name,class_name,scout_level,patrols(name)').eq('id', memberId).eq('gudep_id', context.activeGudep.id).maybeSingle()
  if (!member) notFound()
  const [{ data: items }, { data: progress }] = await Promise.all([
    supabase.from('skk_items').select('*,skk_requirements(*)').order('field_number').order('item_number'),
    supabase.from('member_skk_progress').select('skk_item_id,level,status,note').eq('member_id', memberId),
  ])
  return <div>
    <Link href="/dashboard/skk" className="mb-5 inline-flex items-center gap-1 text-xs font-bold text-emerald-400"><ChevronLeft className="h-4 w-4" />Kembali ke daftar</Link>
    <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">SKK Penggalang</p><h1 className="mt-1 text-2xl font-black text-white">{member.name}</h1><p className="mt-1 text-sm text-slate-500">Kelas {member.class_name} · {firstRelated(member.patrols)?.name ?? 'Belum ada regu'} · {member.scout_level}</p></div>
    <SkkProgressManager memberId={memberId} gudepId={context.activeGudep.id} items={(items ?? []) as SkkItem[]} progress={(progress ?? []) as Pick<MemberSkkProgress, 'skk_item_id' | 'level' | 'status' | 'note'>[]} />
  </div>
}
