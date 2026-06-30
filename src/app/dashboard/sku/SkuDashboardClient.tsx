'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  Award, 
  Search, 
  School, 
  ArrowRight, 
  Database,
  Users,
  Compass
} from 'lucide-react'
import { Member } from '@/app/actions/members'
import { getMemberSkuProgressAction } from '@/app/actions/sku'

interface SkuDashboardClientProps {
  gudepName: string
  initialMembers: Member[] | null
  hasDatabaseError: boolean
}

export default function SkuDashboardClient({
  gudepName,
  initialMembers,
  hasDatabaseError: initialHasError
}: SkuDashboardClientProps) {
  const [isDemoMode, setIsDemoMode] = useState(initialHasError || !initialMembers)
  const [members, setMembers] = useState<Member[]>([])
  const [skuStats, setSkuStats] = useState<Record<string, { passed: number; total: number; percent: number }>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // 1. Load members based on mode (DB vs Demo)
  useEffect(() => {
    if (!isDemoMode && initialMembers) {
      setMembers(initialMembers)
    } else {
      const stored = localStorage.getItem(`scouthub_members_${gudepName}`)
      if (stored) {
        setMembers(JSON.parse(stored))
      } else {
        // Fallback to empty if members not initialized yet
        setMembers([])
      }
    }
  }, [isDemoMode, initialMembers, gudepName])

  // 2. Load or seed SKU progress for each member to calculate percentages
  useEffect(() => {
    const fetchAllSkuProgress = async () => {
      setLoading(true)
      const stats: Record<string, { passed: number; total: number; percent: number }> = {}

      for (const member of members) {
        if (isDemoMode) {
          // Demo Mode: read/seed localStorage
          const localKey = `scouthub_sku_progress_${member.id}`
          let progress = localStorage.getItem(localKey)
          
          if (!progress) {
            // Seed realistic progress for mock members
            const seededProgress: Record<number, { status: string; notes: string }> = {}
            let passedCount = 0
            
            // Seed depending on member ID
            if (member.id === 'mock-1') passedCount = 24 // Rian: 80%
            else if (member.id === 'mock-2') passedCount = 18 // Siti: 60%
            else if (member.id === 'mock-3') passedCount = 13 // Budi: 43%
            else if (member.id === 'mock-4') passedCount = 30 // Larasati: 100%
            else if (member.id === 'mock-5') passedCount = 0  // Dedi: 0%
            else passedCount = Math.floor(Math.random() * 15) // Random for new members
            
            for (let i = 1; i <= 30; i++) {
              if (i <= passedCount) {
                seededProgress[i] = { status: 'Lulus', notes: 'Disetujui pembina' }
              } else if (i === passedCount + 1 && passedCount < 30) {
                seededProgress[i] = { status: 'Proses', notes: 'Sedang latihan' }
              } else if (i === passedCount + 2 && passedCount < 29) {
                seededProgress[i] = { status: 'Revisi', notes: 'Perlu latihan ulang' }
              } else {
                seededProgress[i] = { status: 'Belum', notes: '' }
              }
            }
            
            localStorage.setItem(localKey, JSON.stringify(seededProgress))
            progress = JSON.stringify(seededProgress)
          }

          const parsed = JSON.parse(progress)
          const passed = Object.values(parsed).filter((p: any) => p.status === 'Lulus').length
          stats[member.id] = {
            passed,
            total: 30,
            percent: Math.round((passed / 30) * 100)
          }
        } else {
          // Supabase Mode
          const res = await getMemberSkuProgressAction(member.id)
          if (res.data) {
            const passed = res.data.filter(p => p.status === 'Lulus').length
            stats[member.id] = {
              passed,
              total: res.data.length || 30,
              percent: Math.round((passed / (res.data.length || 30)) * 100)
            }
          } else {
            stats[member.id] = { passed: 0, total: 30, percent: 0 }
          }
        }
      }

      setSkuStats(stats)
      setLoading(false)
    }

    if (members.length > 0) {
      fetchAllSkuProgress()
    } else {
      setLoading(false)
    }
  }, [members, isDemoMode])

  // Filter members by search query
  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.regu && m.regu.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.class.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [members, searchQuery])

  return (
    <div className="space-y-6">
      
      {/* Demo Mode Notification */}
      {isDemoMode && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">🔧 Mode Demo Aktif: </span> 
              Menampilkan data pencapaian SKU dari LocalStorage browser karena database Supabase belum terhubung.
            </div>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl glass-card relative overflow-hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <Award className="h-3.5 w-3.5" />
            SKU Tracker
          </span>
          <h2 className="text-2xl font-extrabold text-white">Pemantauan Syarat Kecakapan Umum (SKU)</h2>
          <p className="text-xs text-emerald-100/50 mt-1">
            Pantau progres pencapaian SKU Penggalang Ramu untuk setiap anggota pramuka di pangkalan Anda.
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="glass-card rounded-2xl p-5">
        <div className="relative w-full md:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-100/40">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Cari nama anggota, kelas, atau regu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="custom-input block w-full rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-emerald-100/30"
          />
        </div>
      </section>

      {/* Members SKU Grid/List */}
      <section className="glass-card rounded-2xl overflow-hidden border border-emerald-500/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-500/10 text-left">
            <thead className="bg-emerald-950/20 text-[10px] font-bold text-emerald-100/60 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4">Nama Anggota</th>
                <th scope="col" className="px-6 py-4">Kelas</th>
                <th scope="col" className="px-6 py-4">Regu</th>
                <th scope="col" className="px-6 py-4">Lulus Item</th>
                <th scope="col" className="px-6 py-4">Progres SKU</th>
                <th scope="col" className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/5 text-xs text-emerald-100/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-emerald-100/40">
                    Mengkalkulasi progres SKU...
                  </td>
                </tr>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => {
                  const stats = skuStats[member.id] || { passed: 0, total: 30, percent: 0 }
                  return (
                    <tr key={member.id} className="hover:bg-emerald-950/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.class}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-amber-400 font-semibold">
                        {member.regu || <span className="text-emerald-100/30 italic">Belum Diatur</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono">
                        <span className="text-white font-bold">{stats.passed}</span>
                        <span className="text-emerald-100/40"> / {stats.total}</span>
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300">
                            <span>Penggalang Ramu</span>
                            <span className="font-bold">{stats.percent}%</span>
                          </div>
                          <div className="w-full bg-emerald-950/60 rounded-full h-2 overflow-hidden border border-emerald-500/10">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                stats.percent === 100 
                                  ? 'bg-emerald-400' 
                                  : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                              }`}
                              style={{ width: `${stats.percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/dashboard/sku/${member.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500 hover:text-slate-950 transition-all text-xs"
                        >
                          Kelola Progres
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-emerald-100/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-emerald-100/20" />
                      <span>Tidak ada data anggota ditemukan. Sila tambahkan anggota di modul Anggota terlebih dahulu.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}
