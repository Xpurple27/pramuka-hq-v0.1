import React from 'react'
import Link from 'next/link'
import { Compass, ArrowRight, Shield, Users, CheckSquare, Award } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-[#090e0c]">
      {/* Background ambient glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[20%] h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[130px]" />
      </div>

      {/* Navbar */}
      <nav className="glass-panel sticky top-0 z-50 w-full border-b border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Compass className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Scout<span className="text-emerald-400">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-emerald-100/80 hover:text-white transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="glow-btn inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              Daftar Pembina
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-6">
          <Shield className="h-3.5 w-3.5" />
          Sistem Manajemen Pramuka Terintegrasi
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl">
          Kelola Gugus Depan Pramuka Lebih <span className="text-emerald-400">Praktis & Teratur</span>
        </h1>
        
        <p className="max-w-2xl text-base sm:text-lg text-emerald-100/60 mb-10 leading-relaxed">
          Platform administrasi dan pelaporan digital untuk pembina pramuka. Kelola data anggota, rekap presensi latihan, unit/regu, hingga pelacakan progress pencapaian SKU secara mudah.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm sm:max-w-md mb-20">
          <Link
            href="/register"
            className="glow-btn flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 text-sm font-bold text-slate-950 hover:bg-emerald-400 active:scale-98 transition-all"
          >
            Mulai Kelola Gudep
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-6 text-sm font-bold text-emerald-300 hover:bg-emerald-900/30 hover:border-emerald-500/40 active:scale-98 transition-all"
          >
            Masuk Sebagai Pembina
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Card 1 */}
          <div className="glass-card rounded-2xl p-6">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Manajemen Anggota & Regu</h3>
            <p className="text-sm text-emerald-100/50 leading-relaxed">
              Strukturisasi kelompok secara rapi. Monitoring regu/unit kerja pramuka dan data profil masing-masing anggota pramuka dalam satu sistem terpusat.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card rounded-2xl p-6">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Presensi Latihan Rutin</h3>
            <p className="text-sm text-emerald-100/50 leading-relaxed">
              Catat dan awasi kehadiran anggota pramuka pada latihan rutin mingguan. Dilengkapi statistik kehadiran dan pelaporan otomatis.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card rounded-2xl p-6">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Pelacakan SKU & SKK</h3>
            <p className="text-sm text-emerald-100/50 leading-relaxed">
              Monitoring pencapaian Syarat Kecakapan Umum (SKU) dan Syarat Kecakapan Khusus (SKK) untuk pelantikan tingkat Penggalang Ramu, Rakit, dan Terap.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-emerald-500/5 py-8 text-center text-xs text-emerald-100/30">
        <p>© 2026 ScoutHub. Hak Cipta Dilindungi Undang-Undang.</p>
        <p className="mt-1 font-mono">Dibuat khusus untuk Pembina Pramuka Indonesia</p>
      </footer>
    </div>
  )
}
