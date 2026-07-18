import Link from 'next/link'
import { BadgeCheck, ChevronRight } from 'lucide-react'
import { EmptyGudep, PageHeading } from '@/components/dashboard/page-heading'
import { getDashboardContext } from '@/lib/scouthub-context'
import { createClient } from '@/utils/supabase/server'
import { firstRelated } from '@/lib/relations'

export default async function SkkPage() {
  const context = await getDashboardContext()
  if (!context.activeGudep) return <><PageHeading title="SKK" description="Pantau kecakapan khusus anggota." /><EmptyGudep /></>
  const supabase = await createClient()
  const { data: members } = await supabase
    .from('members')
    .select('id,name,class_name,scout_level,member_skk_progress(level,status),patrols(name)')
    .eq('gudep_id', context.activeGudep.id)
    .eq('status', 'Aktif')
    .order('name')

  return <div>
    <PageHeading eyebrow="Syarat Kecakapan Khusus" title="Progress SKK Anggota" description="Kelola 81 jenis SKK Penggalang berdasarkan lima bidang, lengkap dengan jenjang Purwa, Madya, dan Utama." />
    {members?.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{members.map((member) => {
      const passed = member.member_skk_progress?.filter((item: { status: string }) => item.status === 'Lulus') ?? []
      const utama = passed.filter((item: { level: string }) => item.level === 'Utama').length
      return <Link key={member.id} href={`/dashboard/skk/${member.id}`} className="card group p-5">
        <div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400/10 text-sky-300"><BadgeCheck className="h-5 w-5" /></span><ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400" /></div>
        <h2 className="mt-4 font-bold text-white">{member.name}</h2>
        <p className="mt-1 text-xs text-slate-500">{member.class_name} · {firstRelated(member.patrols)?.name ?? 'Belum ada regu'}</p>
        <p className="mt-1 text-xs font-semibold text-amber-300">{member.scout_level}</p>
        <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white/[0.03] p-3"><strong className="text-lg text-white">{passed.length}</strong><p className="text-[10px] text-slate-500">tingkat lulus</p></div><div className="rounded-xl bg-white/[0.03] p-3"><strong className="text-lg text-emerald-300">{utama}</strong><p className="text-[10px] text-slate-500">SKK Utama</p></div></div>
      </Link>
    })}</div> : <div className="card p-10 text-center text-sm text-slate-500">Belum ada anggota aktif untuk dinilai.</div>}
  </div>
}
