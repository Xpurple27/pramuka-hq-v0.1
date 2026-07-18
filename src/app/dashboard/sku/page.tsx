import Link from 'next/link'
import { Award, ChevronRight } from 'lucide-react'
import { EmptyGudep, PageHeading } from '@/components/dashboard/page-heading'
import { getDashboardContext } from '@/lib/scouthub-context'
import { createClient } from '@/utils/supabase/server'
import { firstRelated } from '@/lib/relations'

export default async function SkuPage() {
  const context = await getDashboardContext()
  if (!context.activeGudep) return <><PageHeading title="SKU" description="Pantau kecakapan anggota." /><EmptyGudep /></>
  const supabase = await createClient()
  const { data: members } = await supabase.from('members').select('id,name,class_name,scout_level,member_sku_progress(status),patrols(name)').eq('gudep_id', context.activeGudep.id).eq('status', 'Aktif').order('name')
  const levels = [...new Set((members ?? []).map((member) => member.scout_level))]
  const { data: counts } = await supabase.from('sku_items').select('level,id').in('level', levels.length ? levels : ['Penggalang Ramu'])

  return (
    <div>
      <PageHeading eyebrow="Syarat Kecakapan Umum" title="Progress SKU Anggota" description="Pilih anggota untuk memvalidasi setiap item SKU. Persentase dihitung dari jumlah item berstatus Lulus." />
      {members?.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => {
            const total = counts?.filter((item) => item.level === member.scout_level).length ?? 0
            const passed = member.member_sku_progress?.filter((item: { status: string }) => item.status === 'Lulus').length ?? 0
            const percent = total ? Math.round((passed / total) * 100) : 0
            return (
              <Link key={member.id} href={`/dashboard/sku/${member.id}`} className="card group p-5">
                <div className="flex items-start justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 text-amber-300"><Award className="h-5 w-5" /></span><ChevronRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400" /></div>
                <h2 className="mt-4 font-bold text-white">{member.name}</h2>
                <p className="mt-1 text-xs text-slate-500">{member.class_name} · {firstRelated(member.patrols)?.name ?? 'Belum ada regu'}</p>
                <p className="mt-1 text-xs font-semibold text-amber-300">{member.scout_level}</p>
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-[11px]"><span className="text-slate-500">{passed}/{total} lulus</span><strong className="text-white">{percent}%</strong></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${percent}%` }} /></div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : <div className="card p-10 text-center text-sm text-slate-500">Belum ada anggota aktif untuk dinilai.</div>}
    </div>
  )
}
