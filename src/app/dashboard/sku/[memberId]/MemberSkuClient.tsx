'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  Award, 
  ChevronLeft, 
  Search, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HelpCircle,
  Database,
  Check,
  Edit3,
  User,
  Calendar,
  AlertTriangle
} from 'lucide-react'
import { Member } from '@/app/actions/members'
import { MemberSkuProgress, updateMemberSkuStatusAction } from '@/app/actions/sku'
import { SKU_RAMU_SEED } from '@/utils/supabase/skuSeedData'

interface MemberSkuClientProps {
  memberId: string
  gudepName: string
  initialMember: Member | null
  initialProgress: MemberSkuProgress[] | null
  hasDatabaseError: boolean
}

export default function MemberSkuClient({
  memberId,
  gudepName,
  initialMember,
  initialProgress,
  hasDatabaseError: initialHasError
}: MemberSkuClientProps) {
  const [isDemoMode, setIsDemoMode] = useState(initialHasError || !initialMember)
  const [member, setMember] = useState<Member | null>(null)
  const [progress, setProgress] = useState<MemberSkuProgress[]>([])
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [selectedSku, setSelectedSku] = useState<MemberSkuProgress | null>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // 1. Initialize Member profile details
  useEffect(() => {
    if (!isDemoMode && initialMember) {
      setMember(initialMember)
    } else {
      // Demo Mode fallback: read member from local members list
      const storedMembers = localStorage.getItem(`scouthub_members_${gudepName}`)
      if (storedMembers) {
        const list: Member[] = JSON.parse(storedMembers)
        const found = list.find(m => m.id === memberId)
        if (found) {
          setMember(found)
        } else {
          // If not found, use a temporary template
          setMember({
            id: memberId,
            gudep_name: gudepName,
            name: 'Anggota Pramuka',
            class: '7',
            gender: 'L',
            status: 'Aktif'
          })
        }
      }
    }
  }, [isDemoMode, initialMember, memberId, gudepName])

  // 2. Initialize SKU progress
  useEffect(() => {
    if (!isDemoMode && initialProgress) {
      setProgress(initialProgress)
    } else {
      // Demo Mode: read/initialize progress from localStorage
      const localKey = `scouthub_sku_progress_${memberId}`
      const storedProgress = localStorage.getItem(localKey)
      
      if (storedProgress) {
        const parsed = JSON.parse(storedProgress)
        // Merge standard seed templates with local progress records
        const merged: MemberSkuProgress[] = SKU_RAMU_SEED.map(sku => {
          const record = parsed[sku.id] || { status: 'Belum', notes: '' }
          return {
            sku_id: sku.id,
            point_number: sku.point_number,
            category: sku.category,
            description: sku.description,
            status: record.status || 'Belum',
            notes: record.notes || ''
          }
        })
        setProgress(merged)
      } else {
        // Seed default empty progress
        const defaultProgress: Record<number, { status: string; notes: string }> = {}
        SKU_RAMU_SEED.forEach(sku => {
          defaultProgress[sku.id] = { status: 'Belum', notes: '' }
        })
        localStorage.setItem(localKey, JSON.stringify(defaultProgress))
        
        const initialList: MemberSkuProgress[] = SKU_RAMU_SEED.map(sku => ({
          sku_id: sku.id,
          point_number: sku.point_number,
          category: sku.category,
          description: sku.description,
          status: 'Belum',
          notes: ''
        }))
        setProgress(initialList)
      }
    }
  }, [isDemoMode, initialProgress, memberId])

  // Notification helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const total = progress.length || 30
    const passed = progress.filter(p => p.status === 'Lulus').length
    const processing = progress.filter(p => p.status === 'Proses').length
    const revision = progress.filter(p => p.status === 'Revisi').length
    const notYet = progress.filter(p => p.status === 'Belum').length
    const percent = total > 0 ? Math.round((passed / total) * 100) : 0

    return { total, passed, processing, revision, notYet, percent }
  }, [progress])

  // Filtered SKU list
  const filteredProgress = useMemo(() => {
    return progress.filter(p => {
      const matchesSearch = p.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.point_number.toString() === searchQuery
      const matchesStatus = filterStatus === 'Semua' || p.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [progress, searchQuery, filterStatus])

  // Action: Update SKU Point Status
  const handleUpdateStatus = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedSku) return
    setFormLoading(true)

    const formData = new FormData(e.currentTarget)
    const status = formData.get('status') as 'Belum' | 'Proses' | 'Lulus' | 'Revisi'
    const notes = formData.get('notes') as string

    if (isDemoMode) {
      // Demo Mode: save to localStorage
      const localKey = `scouthub_sku_progress_${memberId}`
      const storedProgress = localStorage.getItem(localKey)
      let parsed: Record<number, { status: string; notes: string }> = {}
      
      if (storedProgress) {
        parsed = JSON.parse(storedProgress)
      }
      
      parsed[selectedSku.sku_id] = { status, notes }
      localStorage.setItem(localKey, JSON.stringify(parsed))
      
      // Update state
      setProgress(progress.map(p => 
        p.sku_id === selectedSku.sku_id ? { ...p, status, notes } : p
      ))
      
      showToast(`SKU Poin ${selectedSku.point_number} berhasil diperbarui (Penyimpanan Lokal).`)
      setIsUpdateModalOpen(false)
      setFormLoading(false)
    } else {
      // Supabase Mode
      const res = await updateMemberSkuStatusAction(memberId, selectedSku.sku_id, status, notes)
      setFormLoading(false)
      if (res.error) {
        showToast(res.error, 'error')
      } else {
        showToast(`SKU Poin ${selectedSku.point_number} berhasil diperbarui ke database.`)
        setProgress(progress.map(p => 
          p.sku_id === selectedSku.sku_id ? { ...p, status, notes } : p
        ))
        setIsUpdateModalOpen(false)
      }
    }
  }

  // Get status color coding
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Lulus':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'Proses':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Revisi':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Lulus':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      case 'Proses':
        return <Clock className="h-4 w-4 text-blue-400" />
      case 'Revisi':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />
      default:
        return <HelpCircle className="h-4 w-4 text-zinc-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl px-5 py-4 border shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-950/90 border-red-500/30 text-red-400'
        }`}>
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">🔧 Mode Demo Aktif: </span> 
              Perubahan status SKU disimpan di LocalStorage karena tabel Supabase belum terkonfigurasi.
            </div>
          </div>
        </div>
      )}

      {/* Back to list & Profile header */}
      <section className="space-y-4">
        <Link 
          href="/dashboard/sku" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Daftar SKU Anggota
        </Link>

        {member && (
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                Pencapaian SKU Ramu
              </span>
              <h2 className="text-2xl font-extrabold text-white">{member.name}</h2>
              <p className="text-xs text-emerald-100/50 mt-1 flex items-center gap-4">
                <span>Kelas: <strong>{member.class}</strong></span>
                <span>Regu: <strong className="text-amber-400">{member.regu || 'Belum Diatur'}</strong></span>
                <span>Pangkalan: <strong>{gudepName}</strong></span>
              </p>
            </div>

            {/* Total Percentage Circle/Badge */}
            <div className="bg-emerald-950/40 border border-emerald-500/15 rounded-xl px-5 py-4 flex items-center gap-4 self-start md:self-center">
              <div className="relative flex items-center justify-center">
                {/* Visual meter */}
                <div className="h-12 w-12 rounded-full border-4 border-emerald-950 flex items-center justify-center text-xs font-bold text-emerald-400 font-mono">
                  {stats.percent}%
                </div>
              </div>
              <div>
                <p className="text-[10px] text-emerald-100/40 uppercase font-bold tracking-wider">Progress Total</p>
                <p className="text-xs text-white mt-0.5 font-bold">
                  {stats.passed} dari {stats.total} Poin Lulus
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Progress Stats bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-100/40 uppercase font-bold">Lulus</p>
            <p className="text-sm font-bold text-white font-mono">{stats.passed} Poin</p>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-100/40 uppercase font-bold">Proses</p>
            <p className="text-sm font-bold text-white font-mono">{stats.processing} Poin</p>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-100/40 uppercase font-bold">Revisi</p>
            <p className="text-sm font-bold text-white font-mono">{stats.revision} Poin</p>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-500/15 text-zinc-400 flex items-center justify-center shrink-0">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-100/40 uppercase font-bold">Belum</p>
            <p className="text-sm font-bold text-white font-mono">{stats.notYet} Poin</p>
          </div>
        </div>
      </section>

      {/* Main Checklist items */}
      <section className="space-y-4">
        {/* Filtering & Search control */}
        <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-100/40">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              placeholder="Cari deskripsi SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="custom-input block w-full rounded-xl py-2 pl-9 pr-4 text-xs text-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] font-bold text-emerald-100/40 uppercase tracking-wider whitespace-nowrap">Filter Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="custom-input block w-full sm:w-36 rounded-xl py-1.5 px-2 text-xs text-white bg-slate-900"
            >
              <option value="Semua">Semua</option>
              <option value="Belum">Belum</option>
              <option value="Proses">Proses</option>
              <option value="Lulus">Lulus</option>
              <option value="Revisi">Revisi</option>
            </select>
          </div>
        </div>

        {/* List of SKU checklist */}
        <div className="space-y-3">
          {filteredProgress.length > 0 ? (
            filteredProgress.map((item) => (
              <div 
                key={item.sku_id}
                className="glass-card rounded-2xl p-5 border border-emerald-500/10 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-emerald-500/20 transition-all"
              >
                <div className="flex gap-4 items-start">
                  {/* Point number indicator */}
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-400 font-mono shrink-0">
                    {item.point_number}
                  </div>
                  
                  {/* Point Description & Leader note */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">{item.description}</p>
                    {item.notes && (
                      <div className="text-xs bg-slate-950/50 border border-emerald-500/5 rounded-lg p-2.5 text-emerald-300">
                        <span className="font-bold text-[10px] block uppercase text-emerald-500/70 mb-0.5">Catatan Pembina:</span>
                        {item.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badges & Edit Button */}
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${getStatusBadge(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status}
                  </span>
                  
                  <button
                    onClick={() => {
                      setSelectedSku(item)
                      setIsUpdateModalOpen(true)
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all"
                    title="Perbarui Status"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center text-emerald-100/40">
              Tidak ada poin SKU yang cocok dengan filter pencarian.
            </div>
          )}
        </div>
      </section>

      {/* ================= MODAL: UPDATE SKU STATUS ================= */}
      {isUpdateModalOpen && selectedSku && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card rounded-2xl border border-emerald-500/20 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-400" />
                Perbarui SKU Poin {selectedSku.point_number}
              </h3>
              <button 
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-emerald-100/50 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-emerald-500/5">
                <span className="text-[10px] text-emerald-400 font-bold block uppercase mb-1">Deskripsi Syarat:</span>
                <p className="text-xs text-white leading-relaxed font-medium">{selectedSku.description}</p>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                {/* Status Dropdown */}
                <div className="space-y-1">
                  <label htmlFor="status" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Status Ujian SKU
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    defaultValue={selectedSku.status}
                    className="custom-input block w-full rounded-xl py-2.5 px-3 text-xs text-white bg-slate-900"
                  >
                    <option value="Belum" className="bg-slate-950">Belum (Belum Diuji)</option>
                    <option value="Proses" className="bg-slate-950">Proses (Dalam Pengujian)</option>
                    <option value="Lulus" className="bg-slate-950">Lulus (Telah Disetujui)</option>
                    <option value="Revisi" className="bg-slate-950">Revisi (Perlu Diuji Ulang)</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label htmlFor="notes" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Catatan Pembina / Masukan
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    defaultValue={selectedSku.notes}
                    placeholder="Contoh: Hafalan lancar, melafalkan doa dengan baik dan benar."
                    className="custom-input block w-full rounded-xl py-2 px-3 text-xs text-white resize-none"
                  />
                </div>

                {/* Actions buttons */}
                <div className="flex gap-3 pt-4 border-t border-emerald-500/10">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-900 border border-emerald-500/10 text-xs font-bold text-emerald-100 hover:bg-slate-950 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="glow-btn flex-1 py-3 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                  >
                    {formLoading ? 'Memproses...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
