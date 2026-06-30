import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { 
  School, 
  Users, 
  Calendar, 
  Award,
  BookOpen,
  Activity,
  ArrowUpRight
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Fetch user information on the server
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const fullName = user.user_metadata?.full_name || 'Pembina Pramuka'
  const schoolName = user.user_metadata?.school || 'Pangkalan Belum Diatur'
  const email = user.email

  // Dummy statistics for MVP preview
  const stats = [
    { label: 'Total Anggota', value: '42', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Regu Aktif', value: '6', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Jadwal Latihan', value: '2', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'SKU Disetujui', value: '18', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ]

  const upcomingActivities = [
    { title: 'Latihan Rutin Mingguan', date: 'Jumat, 3 Juli 2026', time: '14.00 - 16.00', location: 'Lap. Utama' },
    { title: 'Persiapan Kemah Bulanan', date: 'Sabtu, 11 Juli 2026', time: '09.00 - selesai', location: 'Aula Pramuka' },
  ]

  const skuProgression = [
    { name: 'Rian Hidayat', target: 'SKU Penggalang Ramu', progress: 80 },
    { name: 'Siti Aminah', target: 'SKU Penggalang Rakit', progress: 60 },
    { name: 'Budi Santoso', target: 'SKU Penggalang Terap', progress: 45 },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <section className="p-6 sm:p-8 rounded-2xl glass-card relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              Salam Pramuka!
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Selamat Datang, {fullName}
            </h2>
            <p className="mt-1 text-sm text-emerald-100/60 flex items-center gap-2">
              <School className="h-4 w-4 text-emerald-400" />
              Mulai kelola administrasi pramuka di {schoolName}
            </p>
          </div>
          <div className="text-xs font-mono bg-emerald-950/40 border border-emerald-500/10 rounded-xl p-3 text-emerald-300/80">
            <p>Email: {email}</p>
            <p className="mt-1">Status: Pembina Aktif</p>
          </div>
        </div>
      </section>

      {/* Statistics Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-emerald-100/50 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </section>

      {/* Main Grid: Activities & SKU Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Activities */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" />
                Kegiatan Terdekat
              </h3>
              <button className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                Lihat Kalender <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-4">
              {upcomingActivities.map((act, i) => (
                <div key={i} className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{act.title}</h4>
                    <p className="text-xs text-emerald-100/60 mt-1">{act.date} • {act.time}</p>
                  </div>
                  <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-emerald-950/60 border border-emerald-500/10 text-emerald-300 self-start sm:self-center">
                    {act.location}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-emerald-500/5 text-center">
            <span className="text-xs text-emerald-100/40">Fase MVP: Modul presensi dan jadwal kegiatan akan hadir pada tahap selanjutnya.</span>
          </div>
        </div>

        {/* SKU Progress Monitor */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-5">
            <Award className="h-4 w-4 text-amber-400" />
            Progress SKU Teratas
          </h3>

          <div className="space-y-5">
            {skuProgression.map((member, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-white">{member.name}</span>
                  <span className="text-amber-400 font-mono">{member.progress}%</span>
                </div>
                <div className="w-full bg-emerald-950/60 rounded-full h-1.5 overflow-hidden border border-emerald-500/10">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-amber-400 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${member.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-emerald-100/50">{member.target}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-emerald-500/5 text-center">
            <button className="w-full py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/10 text-xs font-bold text-emerald-400 hover:bg-emerald-900/30 transition-all flex items-center justify-center gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              Kelola Semua SKU
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
