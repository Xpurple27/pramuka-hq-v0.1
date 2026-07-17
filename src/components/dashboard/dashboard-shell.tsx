'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Award, CalendarDays, ClipboardCheck, Compass, FileBarChart, LayoutDashboard, LogOut, Menu, School, Settings, ShieldCheck, Users, X } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { selectGudepAction } from '@/app/actions/data'
import type { Gudep } from '@/types/scouthub'

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/gudep', label: 'Gudep', icon: School },
  { href: '/dashboard/members', label: 'Anggota', icon: Users },
  { href: '/dashboard/patrols', label: 'Regu', icon: ShieldCheck },
  { href: '/dashboard/training', label: 'Latihan', icon: CalendarDays },
  { href: '/dashboard/attendance', label: 'Absensi', icon: ClipboardCheck },
  { href: '/dashboard/sku', label: 'SKU', icon: Award },
  { href: '/dashboard/reports', label: 'Laporan', icon: FileBarChart },
  { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings },
]

type Props = { children: React.ReactNode; fullName: string; email: string; gudep: Gudep[]; activeGudep: Gudep | null }

export default function DashboardShell({ children, fullName, email, gudep, activeGudep }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleGudepChange = (id: string) => startTransition(async () => {
    await selectGudepAction(id)
    router.refresh()
  })

  const nav = (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-white/8 px-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400 text-slate-950"><Compass className="h-5 w-5" /></span>
        <div><p className="font-black tracking-tight text-white">Scout<span className="text-emerald-400">Hub</span></p><p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Gudep workspace</p></div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
          return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon className="h-4 w-4" />{label}</Link>
        })}
      </nav>
      <div className="border-t border-white/8 p-4">
        <div className="mb-3 min-w-0"><p className="truncate text-sm font-bold text-white">{fullName}</p><p className="truncate text-xs text-slate-500">{email}</p></div>
        <form action={logoutAction}><button className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-400/10"><LogOut className="h-4 w-4" /> Keluar</button></form>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#07100c] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/8 bg-[#09130f]/95 backdrop-blur-xl lg:flex">{nav}</aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Tutup menu" className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} /><aside className="relative flex h-full w-72 flex-col border-r border-white/10 bg-[#09130f]"><button aria-label="Tutup menu" className="absolute right-3 top-3 z-10 rounded-lg p-2 text-slate-400 hover:bg-white/5" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>{nav}</aside></div>}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/8 bg-[#07100c]/85 px-4 backdrop-blur-xl sm:px-6">
          <button aria-label="Buka menu" className="rounded-xl border border-white/10 p-2 text-slate-300 lg:hidden" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-white">{activeGudep?.name ?? 'Belum ada gudep'}</p><p className="truncate text-xs text-slate-500">{activeGudep?.school_name ?? 'Buat gudep untuk mulai menggunakan aplikasi'}</p></div>
          {gudep.length > 0 && <select aria-label="Pilih gudep aktif" value={activeGudep?.id ?? ''} disabled={isPending} onChange={(event) => handleGudepChange(event.target.value)} className="max-w-48 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white outline-none focus:border-emerald-400">{gudep.map((item) => <option key={item.id} value={item.id} className="bg-slate-900">{item.name}</option>)}</select>}
        </header>
        <main className="mx-auto max-w-7xl p-4 pb-24 sm:p-6 lg:p-8">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/10 bg-[#09130f]/95 px-1 py-1.5 backdrop-blur-xl lg:hidden">{navigation.slice(0, 5).map(({ href, label, icon: Icon }) => { const active = href === '/dashboard' ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] ${active ? 'text-emerald-400' : 'text-slate-500'}`}><Icon className="h-4 w-4" />{label}</Link> })}</nav>
    </div>
  )
}
