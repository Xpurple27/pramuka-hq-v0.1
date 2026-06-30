import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { logoutAction } from '@/app/actions/auth'
import { Compass, User, LogOut, School, LayoutDashboard, Users, Award } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const fullName = user.user_metadata?.full_name || 'Pembina Pramuka'
  const schoolName = user.user_metadata?.school || 'Pangkalan Belum Diatur'

  return (
    <div className="min-h-screen flex flex-col bg-[#090e0c]">
      {/* Top Navbar */}
      <header className="glass-panel sticky top-0 z-50 w-full border-b border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Scout<span className="text-emerald-400">Hub</span>
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-100/70 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dasbor
              </Link>
              <Link
                href="/dashboard/members"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-100/70 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
              >
                <Users className="h-4 w-4" />
                Anggota
              </Link>
              <Link
                href="/dashboard/sku"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-100/70 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
              >
                <Award className="h-4 w-4" />
                SKU Tracker
              </Link>
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-white">{fullName}</span>
              <span className="text-[10px] text-emerald-400/80 font-mono tracking-tight">{schoolName}</span>
            </div>
            
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <User className="h-5 w-5" />
            </div>

            {/* Logout Action */}
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center justify-center p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-slate-950 transition-all active:scale-95"
                title="Keluar dari Akun"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 text-xs font-bold hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-emerald-500/5 bg-slate-950/40 px-4 h-12 items-center justify-around">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-100/70 hover:text-emerald-400"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dasbor
          </Link>
          <Link
            href="/dashboard/members"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-100/70 hover:text-emerald-400"
          >
            <Users className="h-4 w-4" />
            Anggota
          </Link>
          <Link
            href="/dashboard/sku"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-100/70 hover:text-emerald-400"
          >
            <Award className="h-4 w-4" />
            SKU
          </Link>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
