'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  X, 
  User, 
  School, 
  Users, 
  AlertCircle, 
  Database,
  ArrowUpDown,
  Check,
  HelpCircle
} from 'lucide-react'
import { Member, addMemberAction, updateMemberAction, deleteMemberAction } from '@/app/actions/members'

interface MemberManagementClientProps {
  gudepName: string
  initialMembers: Member[] | null
  hasDatabaseError: boolean
}

// Default mock members to seed localStorage in demo mode
const DEFAULT_MOCK_MEMBERS: Member[] = [
  { id: 'mock-1', gudep_name: '', name: 'Rian Hidayat', class: '8A', gender: 'L', regu: 'Elang', status: 'Aktif', notes: 'Wakil Pemimpin Regu (Wapinru)' },
  { id: 'mock-2', gudep_name: '', name: 'Siti Aminah', class: '7B', gender: 'P', regu: 'Mawar', status: 'Aktif', notes: 'Pemimpin Regu (Pinru)' },
  { id: 'mock-3', gudep_name: '', name: 'Budi Santoso', class: '9C', gender: 'L', regu: 'Garuda', status: 'Aktif', notes: 'Pratama Putra' },
  { id: 'mock-4', gudep_name: '', name: 'Larasati Putri', class: '9A', gender: 'P', regu: 'Melati', status: 'Alumni', notes: 'Mantan Pratama Putri, lulus tahun ini' },
  { id: 'mock-5', gudep_name: '', name: 'Dedi Kurniawan', class: '8B', gender: 'L', regu: 'Elang', status: 'Cuti', notes: 'Cuti sementara karena pemulihan kesehatan' }
]

export default function MemberManagementClient({
  gudepName,
  initialMembers,
  hasDatabaseError: initialHasError
}: MemberManagementClientProps) {
  // Determine if we should run in local storage demo mode
  const [isDemoMode, setIsDemoMode] = useState(initialHasError || !initialMembers)
  const [members, setMembers] = useState<Member[]>([])
  
  // Notification states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterClass, setFilterClass] = useState('Semua')
  const [filterGender, setFilterGender] = useState('Semua')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterRegu, setFilterRegu] = useState('Semua')
  
  // Modals visibility & data states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Initialize data
  useEffect(() => {
    if (!isDemoMode && initialMembers) {
      setMembers(initialMembers)
    } else {
      // Local Storage Demo Mode
      const stored = localStorage.getItem(`scouthub_members_${gudepName}`)
      if (stored) {
        setMembers(JSON.parse(stored))
      } else {
        const seeded = DEFAULT_MOCK_MEMBERS.map(m => ({ ...m, gudep_name: gudepName }))
        localStorage.setItem(`scouthub_members_${gudepName}`, JSON.stringify(seeded))
        setMembers(seeded)
      }
    }
  }, [isDemoMode, initialMembers, gudepName])

  // Save to local storage helper for demo mode
  const saveLocalMembers = (updated: Member[]) => {
    localStorage.setItem(`scouthub_members_${gudepName}`, JSON.stringify(updated))
    setMembers(updated)
  }

  // Trigger Toast Notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Derived filter options
  const classOptions = useMemo(() => {
    const classes = new Set(members.map(m => m.class))
    return ['Semua', ...Array.from(classes).sort()]
  }, [members])

  const reguOptions = useMemo(() => {
    const regus = new Set(members.filter(m => m.regu).map(m => m.regu as string))
    return ['Semua', ...Array.from(regus).sort()]
  }, [members])

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (m.regu && m.regu.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            m.class.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesClass = filterClass === 'Semua' || m.class === filterClass
      const matchesGender = filterGender === 'Semua' || m.gender === filterGender
      const matchesStatus = filterStatus === 'Semua' || m.status === filterStatus
      const matchesRegu = filterRegu === 'Semua' || m.regu === filterRegu

      return matchesSearch && matchesClass && matchesGender && matchesStatus && matchesRegu
    })
  }, [members, searchQuery, filterClass, filterGender, filterStatus, filterRegu])

  // Actions: Add Member
  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const className = formData.get('class') as string
    const gender = formData.get('gender') as 'L' | 'P'
    const regu = formData.get('regu') as string
    const status = formData.get('status') as 'Aktif' | 'Alumni' | 'Cuti'
    const notes = formData.get('notes') as string

    const dataInput = { name, class: className, gender, regu, status, notes }

    if (isDemoMode) {
      // Demo mode logic
      const newMember: Member = {
        id: `mock-${Date.now()}`,
        gudep_name: gudepName,
        ...dataInput
      }
      const updated = [newMember, ...members]
      saveLocalMembers(updated)
      showToast('Anggota berhasil ditambahkan (Penyimpanan Lokal).')
      setIsAddModalOpen(false)
      setFormLoading(false)
    } else {
      // Supabase logic
      const res = await addMemberAction(gudepName, dataInput)
      setFormLoading(false)
      if (res.error) {
        showToast(res.error, 'error')
      } else {
        showToast('Anggota berhasil ditambahkan ke database.')
        // Reload local state
        if (res.data) {
          setMembers([res.data[0] as Member, ...members])
        }
        setIsAddModalOpen(false)
      }
    }
  }

  // Actions: Edit Member
  const handleEditMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedMember) return
    setFormLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const className = formData.get('class') as string
    const gender = formData.get('gender') as 'L' | 'P'
    const regu = formData.get('regu') as string
    const status = formData.get('status') as 'Aktif' | 'Alumni' | 'Cuti'
    const notes = formData.get('notes') as string

    const dataInput = { name, class: className, gender, regu, status, notes }

    if (isDemoMode) {
      // Demo mode logic
      const updated = members.map(m => 
        m.id === selectedMember.id ? { ...m, ...dataInput } : m
      )
      saveLocalMembers(updated)
      showToast('Data anggota berhasil diperbarui (Penyimpanan Lokal).')
      setIsEditModalOpen(false)
      setFormLoading(false)
    } else {
      // Supabase logic
      const res = await updateMemberAction(selectedMember.id, gudepName, dataInput)
      setFormLoading(false)
      if (res.error) {
        showToast(res.error, 'error')
      } else {
        showToast('Data anggota berhasil diperbarui di database.')
        setMembers(members.map(m => m.id === selectedMember.id ? { ...m, ...dataInput } : m))
        setIsEditModalOpen(false)
      }
    }
  }

  // Actions: Delete Member
  const handleDeleteMember = async () => {
    if (!selectedMember) return
    setFormLoading(true)

    if (isDemoMode) {
      // Demo mode logic
      const updated = members.filter(m => m.id !== selectedMember.id)
      saveLocalMembers(updated)
      showToast('Anggota berhasil dihapus (Penyimpanan Lokal).')
      setIsDeleteConfirmOpen(false)
      setFormLoading(false)
    } else {
      // Supabase logic
      const res = await deleteMemberAction(selectedMember.id, gudepName)
      setFormLoading(true)
      if (res.error) {
        showToast(res.error, 'error')
      } else {
        showToast('Anggota berhasil dihapus dari database.')
        setMembers(members.filter(m => m.id !== selectedMember.id))
        setIsDeleteConfirmOpen(false)
      }
      setFormLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
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

      {/* Demo Mode / DB Alert Banner */}
      {isDemoMode && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">🔧 Mode Demo Aktif: </span> 
              Database Supabase belum terhubung atau tabel <code className="bg-amber-950/60 px-1.5 py-0.5 rounded font-mono">members</code> belum dibuat. Data saat ini disimpan sementara di LocalStorage browser Anda.
            </div>
          </div>
          {!initialHasError && initialMembers && (
            <button 
              onClick={() => setIsDemoMode(false)}
              className="text-xs font-bold bg-amber-500 text-slate-950 px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-colors shrink-0"
            >
              Hubungkan Database
            </button>
          )}
        </div>
      )}

      {/* Top Header Card */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl glass-card relative overflow-hidden">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <School className="h-3.5 w-3.5" />
            {gudepName}
          </span>
          <h2 className="text-2xl font-extrabold text-white">Kelola Anggota Pramuka</h2>
          <p className="text-xs text-emerald-100/50 mt-1">Daftar lengkap, penambahan, edit, dan status pangkalan Anda.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="glow-btn flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-colors self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          Tambah Anggota
        </button>
      </section>

      {/* Filter and Search Panel */}
      <section className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-emerald-100/40">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Cari nama, regu, kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="custom-input block w-full rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-emerald-100/30"
            />
          </div>

          {/* Quick Clear Button */}
          {(filterClass !== 'Semua' || filterGender !== 'Semua' || filterStatus !== 'Semua' || filterRegu !== 'Semua' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterClass('Semua')
                setFilterGender('Semua')
                setFilterStatus('Semua')
                setFilterRegu('Semua')
              }}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors self-end md:self-center"
            >
              Reset Semua Filter
            </button>
          )}
        </div>

        {/* Filter Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-500/5">
          {/* Filter Kelas */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-emerald-100/50 uppercase tracking-wider">Kelas</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="custom-input block w-full rounded-xl py-2 px-3 text-xs text-white bg-slate-900"
            >
              {classOptions.map((c, i) => (
                <option key={i} value={c} className="bg-slate-950">{c}</option>
              ))}
            </select>
          </div>

          {/* Filter Regu */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-emerald-100/50 uppercase tracking-wider">Regu / Satuan</label>
            <select
              value={filterRegu}
              onChange={(e) => setFilterRegu(e.target.value)}
              className="custom-input block w-full rounded-xl py-2 px-3 text-xs text-white bg-slate-900"
            >
              {reguOptions.map((r, i) => (
                <option key={i} value={r} className="bg-slate-950">{r}</option>
              ))}
            </select>
          </div>

          {/* Filter Jenis Kelamin */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-emerald-100/50 uppercase tracking-wider">Jenis Kelamin</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="custom-input block w-full rounded-xl py-2 px-3 text-xs text-white bg-slate-900"
            >
              <option value="Semua" className="bg-slate-950">Semua</option>
              <option value="L" className="bg-slate-950">Laki-laki (L)</option>
              <option value="P" className="bg-slate-950">Perempuan (P)</option>
            </select>
          </div>

          {/* Filter Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-emerald-100/50 uppercase tracking-wider">Status Keaktifan</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="custom-input block w-full rounded-xl py-2 px-3 text-xs text-white bg-slate-900"
            >
              <option value="Semua" className="bg-slate-950">Semua</option>
              <option value="Aktif" className="bg-slate-950">Aktif</option>
              <option value="Alumni" className="bg-slate-950">Alumni</option>
              <option value="Cuti" className="bg-slate-950">Cuti</option>
            </select>
          </div>
        </div>
      </section>

      {/* Members Table Card */}
      <section className="glass-card rounded-2xl overflow-hidden border border-emerald-500/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-emerald-500/10 text-left">
            <thead className="bg-emerald-950/20 text-[10px] font-bold text-emerald-100/60 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4">Nama</th>
                <th scope="col" className="px-6 py-4">Kelas</th>
                <th scope="col" className="px-6 py-4">Jenis Kelamin</th>
                <th scope="col" className="px-6 py-4">Regu</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/5 text-xs text-emerald-100/80">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-emerald-950/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{member.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{member.class}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.gender === 'L' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Laki-laki</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">Perempuan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono">
                      {member.regu ? (
                        <span className="text-amber-400 font-semibold">{member.regu}</span>
                      ) : (
                        <span className="text-emerald-100/30 italic">Belum Diatur</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        member.status === 'Aktif' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : member.status === 'Alumni' 
                          ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedMember(member)
                            setIsDetailModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all"
                          title="Detail Anggota"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member)
                            setIsEditModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all"
                          title="Edit Anggota"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member)
                            setIsDeleteConfirmOpen(true)
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-slate-950 transition-all"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-emerald-100/40">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-emerald-100/20" />
                      <span>Tidak ada data anggota ditemukan.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= MODAL: DETAIL MEMBER ================= */}
      {isDetailModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card rounded-2xl border border-emerald-500/20 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-400" />
                Detail Anggota
              </h3>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="text-emerald-100/50 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-emerald-500/5">
                <span className="text-emerald-100/40 font-semibold">Nama Lengkap</span>
                <span className="col-span-2 text-white font-bold">{selectedMember.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-emerald-500/5">
                <span className="text-emerald-100/40 font-semibold">Pangkalan (Gudep)</span>
                <span className="col-span-2 text-emerald-300 font-mono">{selectedMember.gudep_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-emerald-500/5">
                <span className="text-emerald-100/40 font-semibold">Kelas</span>
                <span className="col-span-2 text-white">{selectedMember.class}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-emerald-500/5">
                <span className="text-emerald-100/40 font-semibold">Jenis Kelamin</span>
                <span className="col-span-2 text-white">
                  {selectedMember.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-emerald-500/5">
                <span className="text-emerald-100/40 font-semibold">Regu / Unit</span>
                <span className="col-span-2 text-amber-400 font-bold">{selectedMember.regu || 'Belum Diatur'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-emerald-500/5">
                <span className="text-emerald-100/40 font-semibold">Status</span>
                <span className="col-span-2">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                    selectedMember.status === 'Aktif' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : selectedMember.status === 'Alumni' 
                      ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {selectedMember.status}
                  </span>
                </span>
              </div>
              <div className="space-y-1.5 py-1.5">
                <span className="text-emerald-100/40 font-semibold block">Catatan Tambahan</span>
                <p className="text-white bg-slate-950/50 p-3 rounded-xl border border-emerald-500/5 min-h-[60px] text-xs">
                  {selectedMember.notes || 'Tidak ada catatan tambahan.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/10 text-xs font-bold text-emerald-400 hover:bg-emerald-900/30 transition-all"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH ANGGOTA ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card rounded-2xl border border-emerald-500/20 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-400" />
                Tambah Anggota Baru
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-emerald-100/50 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                  Nama Lengkap
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap"
                  className="custom-input block w-full rounded-xl py-2.5 px-3 text-xs text-white"
                />
              </div>

              {/* Class & Gender Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="class" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Kelas
                  </label>
                  <input
                    id="class"
                    name="class"
                    type="text"
                    required
                    placeholder="Contoh: 8A, 7B"
                    className="custom-input block w-full rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="gender" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Jenis Kelamin
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    className="custom-input block w-full rounded-xl py-2.5 px-3 text-xs text-white bg-slate-900"
                  >
                    <option value="L" className="bg-slate-950">Laki-laki (L)</option>
                    <option value="P" className="bg-slate-950">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              {/* Regu & Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="regu" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Nama Regu / Satuan
                  </label>
                  <input
                    id="regu"
                    name="regu"
                    type="text"
                    placeholder="Elang, Mawar, dll"
                    className="custom-input block w-full rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="status" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="custom-input block w-full rounded-xl py-2.5 px-3 text-xs text-white bg-slate-900"
                  >
                    <option value="Aktif" className="bg-slate-950">Aktif</option>
                    <option value="Cuti" className="bg-slate-950">Cuti</option>
                    <option value="Alumni" className="bg-slate-950">Alumni</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label htmlFor="notes" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                  Catatan Tambahan
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="Catatan seperti jabatan dalam regu atau riwayat kesehatan"
                  className="custom-input block w-full rounded-xl py-2 px-3 text-xs text-white resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-emerald-500/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 border border-emerald-500/10 text-xs font-bold text-emerald-100 hover:bg-slate-950 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="glow-btn flex-1 py-3 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT ANGGOTA ================= */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card rounded-2xl border border-emerald-500/20 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-amber-400" />
                Ubah Data Anggota
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-emerald-100/50 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditMember} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                  Nama Lengkap
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={selectedMember.name}
                  placeholder="Masukkan nama lengkap"
                  className="custom-input block w-full rounded-xl py-2.5 px-3 text-xs text-white"
                />
              </div>

              {/* Class & Gender Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="class" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Kelas
                  </label>
                  <input
                    id="class"
                    name="class"
                    type="text"
                    required
                    defaultValue={selectedMember.class}
                    placeholder="Contoh: 8A, 7B"
                    className="custom-input block w-full rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="gender" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Jenis Kelamin
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    defaultValue={selectedMember.gender}
                    className="custom-input block w-full rounded-xl py-2.5 px-3 text-xs text-white bg-slate-900"
                  >
                    <option value="L" className="bg-slate-950">Laki-laki (L)</option>
                    <option value="P" className="bg-slate-950">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              {/* Regu & Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="regu" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Nama Regu / Satuan
                  </label>
                  <input
                    id="regu"
                    name="regu"
                    type="text"
                    defaultValue={selectedMember.regu || ''}
                    placeholder="Elang, Mawar, dll"
                    className="custom-input block w-full rounded-xl py-2.5 px-3 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="status" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={selectedMember.status}
                    className="custom-input block w-full rounded-xl py-2.5 px-3 text-xs text-white bg-slate-900"
                  >
                    <option value="Aktif" className="bg-slate-950">Aktif</option>
                    <option value="Cuti" className="bg-slate-950">Cuti</option>
                    <option value="Alumni" className="bg-slate-950">Alumni</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label htmlFor="notes" className="block text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
                  Catatan Tambahan
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  defaultValue={selectedMember.notes || ''}
                  placeholder="Catatan tambahan..."
                  className="custom-input block w-full rounded-xl py-2 px-3 text-xs text-white resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-emerald-500/10">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 border border-emerald-500/10 text-xs font-bold text-emerald-100 hover:bg-slate-950 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="glow-btn flex-1 py-3 rounded-xl bg-amber-500 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                >
                  {formLoading ? 'Memperbarui...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: KONFIRMASI HAPUS ================= */}
      {isDeleteConfirmOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass-card rounded-2xl border border-red-500/20 p-6 sm:p-8 space-y-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 mb-2">
              <Trash2 className="h-6 w-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Hapus Anggota?</h3>
              <p className="text-xs text-emerald-100/60 leading-relaxed">
                Apakah Anda yakin ingin menghapus data <span className="text-white font-bold">{selectedMember.name}</span> secara permanen dari pangkalan ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={formLoading}
                className="flex-1 py-3 rounded-xl bg-slate-900 border border-emerald-500/10 text-xs font-bold text-emerald-100 hover:bg-slate-950 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteMember}
                disabled={formLoading}
                className="flex-1 py-3 rounded-xl bg-red-500 text-xs font-bold text-slate-950 hover:bg-red-400 transition-all"
              >
                {formLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
