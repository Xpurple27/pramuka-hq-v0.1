'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Save } from 'lucide-react'
import { saveAttendanceAction } from '@/app/actions/data'
import type { AttendanceStatus } from '@/types/scouthub'

type MemberRow = { id: string; name: string; class_name: string; patrols: { name?: string } | null }
type SessionRow = { id: string; title: string; training_date: string }
type AttendanceRow = { member_id: string; status: AttendanceStatus; note: string | null }
type RowState = { status: AttendanceStatus; note: string }

const statuses: AttendanceStatus[] = ['Hadir', 'Izin', 'Sakit', 'Alpa']

export default function AttendanceManager({ gudepId, members, sessions, selectedSessionId, attendance }: { gudepId: string; members: MemberRow[]; sessions: SessionRow[]; selectedSessionId: string; attendance: AttendanceRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const initial = useMemo(() => Object.fromEntries(members.map((member) => { const saved = attendance.find((row) => row.member_id === member.id); return [member.id, { status: saved?.status ?? 'Hadir', note: saved?.note ?? '' }] })), [members, attendance])
  const [rows, setRows] = useState<Record<string, RowState>>(initial)
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)

  const setAllPresent = () => setRows((current) => Object.fromEntries(Object.entries(current).map(([id, row]) => [id, { ...row, status: 'Hadir' }])))
  const save = () => startTransition(async () => {
    const result = await saveAttendanceAction(selectedSessionId, gudepId, members.map((member) => ({ memberId: member.id, status: rows[member.id]?.status ?? 'Hadir', note: rows[member.id]?.note })))
    setFeedback(result)
    if (result.ok) router.refresh()
  })

  if (!sessions.length) return <div className="card p-10 text-center"><h3 className="font-bold text-white">Belum ada jadwal latihan</h3><p className="mt-2 text-sm text-slate-500">Buat jadwal pada menu Latihan sebelum mengisi absensi.</p></div>
  if (!members.length) return <div className="card p-10 text-center"><h3 className="font-bold text-white">Belum ada anggota aktif</h3><p className="mt-2 text-sm text-slate-500">Tambahkan anggota sebelum mengisi absensi.</p></div>

  const summary = statuses.map((status) => ({ status, count: Object.values(rows).filter((row) => row.status === status).length }))
  return <div className="space-y-4">
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end"><label className="flex-1 space-y-1.5"><span className="text-xs font-bold text-slate-400">Pilih Pertemuan</span><select className="input" value={selectedSessionId} onChange={(event) => router.push(`/dashboard/attendance?session=${event.target.value}`)}>{sessions.map((session) => <option key={session.id} value={session.id}>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(`${session.training_date}T00:00:00`))} — {session.title}</option>)}</select></label><button onClick={setAllPresent} className="btn-secondary"><CheckCircle2 className="h-4 w-4" />Semua Hadir</button><button onClick={save} disabled={isPending} className="btn-primary"><Save className="h-4 w-4" />{isPending ? 'Menyimpan...' : 'Simpan Absensi'}</button></div>
    {feedback && <div className={`rounded-xl border px-4 py-3 text-sm ${feedback.ok ? 'border-emerald-400/20 bg-emerald-400/5 text-emerald-300' : 'border-red-400/20 bg-red-400/5 text-red-300'}`}>{feedback.message}</div>}
    <div className="grid grid-cols-4 gap-2">{summary.map(({ status, count }) => <div key={status} className="card p-3 text-center"><p className="text-xl font-black text-white">{count}</p><p className="text-[11px] text-slate-500">{status}</p></div>)}</div>
    <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/8 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-4 py-3">Anggota</th><th className="px-4 py-3">Kelas/Regu</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Catatan</th></tr></thead><tbody className="divide-y divide-white/5">{members.map((member) => <tr key={member.id}><td className="px-4 py-3.5 font-semibold text-white">{member.name}</td><td className="px-4 py-3.5 text-slate-400">{member.class_name} · {member.patrols?.name ?? 'Belum ada regu'}</td><td className="px-4 py-3.5"><div className="flex gap-1">{statuses.map((status) => <button key={status} onClick={() => setRows((current) => ({ ...current, [member.id]: { ...current[member.id], status } }))} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${rows[member.id]?.status === status ? 'bg-emerald-400 text-slate-950' : 'bg-white/5 text-slate-500 hover:text-white'}`}>{status}</button>)}</div></td><td className="px-4 py-3.5"><input value={rows[member.id]?.note ?? ''} onChange={(event) => setRows((current) => ({ ...current, [member.id]: { ...current[member.id], note: event.target.value } }))} className="input py-2 text-xs" placeholder="Opsional" /></td></tr>)}</tbody></table></div></div>
  </div>
}
