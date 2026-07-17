import Link from 'next/link'
import { CalendarDays, CheckCircle2, ClipboardCheck, ShieldCheck, Users } from 'lucide-react'
import { getDashboardContext } from '@/lib/scouthub-context'
import { createClient } from '@/utils/supabase/server'
import { EmptyGudep, PageHeading } from '@/components/dashboard/page-heading'

export default async function DashboardPage() {
  const context = await getDashboardContext()
  if (!context.activeGudep) return <><PageHeading eyebrow="Pusat Kendali" title={`Salam Pramuka, ${context.fullName}!`} description="Buat gudep pertama Anda untuk mulai mengelola pembinaan." /><EmptyGudep /></>

  const supabase = await createClient()
  const gudepId = context.activeGudep.id
  const today = new Date().toISOString().slice(0, 10)
  const [members, patrols, sessions, attendance, skuProgress, upcoming] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('gudep_id', gudepId).eq('status', 'Aktif'),
    supabase.from('patrols').select('*', { count: 'exact', head: true }).eq('gudep_id', gudepId).eq('is_active', true),
    supabase.from('training_sessions').select('*', { count: 'exact', head: true }).eq('gudep_id', gudepId),
    supabase.from('attendance').select('status,training_sessions!inner(gudep_id)').eq('training_sessions.gudep_id', gudepId),
    supabase.from('member_sku_progress').select('status,members!inner(gudep_id)').eq('members.gudep_id', gudepId),
    supabase.from('training_sessions').select('*').eq('gudep_id', gudepId).gte('training_date', today).order('training_date').limit(3),
  ])
  const attendanceRows = attendance.data ?? []
  const present = attendanceRows.filter((row) => row.status === 'Hadir').length
  const attendanceRate = attendanceRows.length ? Math.round((present / attendanceRows.length) * 100) : 0
  const skuRows = skuProgress.data ?? []
  const passedSku = skuRows.filter((row) => row.status === 'Lulus').length
  const skuRate = skuRows.length ? Math.round((passedSku / skuRows.length) * 100) : 0
  const stats = [
    { label: 'Anggota Aktif', value: members.count ?? 0, icon: Users, color: 'text-emerald-300', href: '/dashboard/members' },
    { label: 'Regu Aktif', value: patrols.count ?? 0, icon: ShieldCheck, color: 'text-amber-300', href: '/dashboard/patrols' },
    { label: 'Total Latihan', value: sessions.count ?? 0, icon: CalendarDays, color: 'text-sky-300', href: '/dashboard/training' },
    { label: 'Kehadiran', value: `${attendanceRate}%`, icon: ClipboardCheck, color: 'text-violet-300', href: '/dashboard/attendance' },
  ]

  return (
    <div>
      <PageHeading eyebrow="Pusat Kendali" title={`Salam Pramuka, ${context.fullName}!`} description={`Pantau kondisi ${context.activeGudep.name} dalam satu tampilan yang selalu mengikuti data Supabase.`} />
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="card group p-4 sm:p-5">
            <div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl bg-white/5 ${color}`}><Icon className="h-5 w-5" /></span><span className="text-xs text-slate-600 transition group-hover:text-emerald-400">Lihat →</span></div>
            <p className="mt-4 text-2xl font-black text-white">{value}</p><p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
          </Link>
        ))}
      </section>
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="font-bold text-white">Latihan berikutnya</h2><p className="text-xs text-slate-500">Agenda terdekat gudep aktif</p></div><Link href="/dashboard/training" className="text-xs font-bold text-emerald-400">Kelola jadwal</Link></div>
          <div className="space-y-3">
            {upcoming.data?.length ? upcoming.data.map((item) => (
              <div key={item.id} className="flex flex-col justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.02] p-4 sm:flex-row sm:items-center"><div><p className="font-semibold text-white">{item.title}</p><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date(`${item.training_date}T00:00:00`))} · {String(item.start_time).slice(0, 5)}</p></div><span className="text-xs font-semibold text-emerald-300">{item.location}</span></div>
            )) : <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">Belum ada latihan mendatang.</p>}
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-bold text-white">Kesehatan pembinaan</h2><p className="mb-5 text-xs text-slate-500">Ringkasan indikator utama</p>
          <div className="space-y-5">
            <div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-400">Kehadiran rata-rata</span><strong className="text-violet-300">{attendanceRate}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-violet-400" style={{ width: `${attendanceRate}%` }} /></div></div>
            <div><div className="mb-2 flex justify-between text-xs"><span className="text-slate-400">Item SKU lulus</span><strong className="text-amber-300">{skuRate}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-amber-400" style={{ width: `${skuRate}%` }} /></div></div>
            <div className="rounded-xl bg-emerald-400/5 p-4"><CheckCircle2 className="mb-2 h-5 w-5 text-emerald-400" /><p className="text-xs leading-5 text-slate-400">Semua statistik dihitung otomatis dari catatan latihan, absensi, dan progress SKU.</p></div>
          </div>
        </div>
      </section>
    </div>
  )
}
