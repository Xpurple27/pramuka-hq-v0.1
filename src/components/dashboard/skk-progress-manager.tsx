'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronDown, Clock3, MinusCircle, Save, Search } from 'lucide-react'
import { saveSkkProgressAction } from '@/app/actions/data'
import type { MemberSkkProgress, SkkItem, SkkLevel, SkuStatus } from '@/types/scouthub'

const levels: SkkLevel[] = ['Purwa', 'Madya', 'Utama']
const statusOptions: SkuStatus[] = ['Belum', 'Proses', 'Lulus']

type RowState = { status: SkuStatus; note: string }

export default function SkkProgressManager({
  memberId,
  gudepId,
  items,
  progress,
}: {
  memberId: string
  gudepId: string
  items: SkkItem[]
  progress: Pick<MemberSkkProgress, 'skk_item_id' | 'level' | 'status' | 'note'>[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [field, setField] = useState('Semua')
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const initial = Object.fromEntries(items.flatMap((item) => levels.map((level) => {
    const saved = progress.find((row) => row.skk_item_id === item.id && row.level === level)
    return [`${item.id}-${level}`, { status: saved?.status ?? 'Belum', note: saved?.note ?? '' }]
  }))) as Record<string, RowState>
  const [rows, setRows] = useState<Record<string, RowState>>(initial)

  const fields = useMemo(() => [...new Set(items.map((item) => item.field_name))], [items])
  const filtered = useMemo(() => items.filter((item) => {
    const matchesField = field === 'Semua' || item.field_name === field
    const needle = query.toLocaleLowerCase('id-ID')
    return matchesField && (!needle || item.name.toLocaleLowerCase('id-ID').includes(needle))
  }), [field, items, query])
  const passed = Object.values(rows).filter((row) => row.status === 'Lulus').length

  const save = (itemId: number, level: SkkLevel) => startTransition(async () => {
    const row = rows[`${itemId}-${level}`]
    const result = await saveSkkProgressAction(memberId, gudepId, itemId, level, row.status, row.note)
    setFeedback(result)
    if (result.ok) router.refresh()
  })

  return <div className="space-y-4">
    <div className="card p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold text-slate-500">Capaian SKK</p><p className="text-2xl font-black text-white">{passed} tingkat lulus</p><p className="mt-1 text-xs text-slate-500">81 jenis SKK · masing-masing Purwa, Madya, dan Utama</p></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" /><input className="input py-2 pl-9 text-xs" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari SKK" /></label>
          <select className="input py-2 text-xs" value={field} onChange={(event) => setField(event.target.value)}><option value="Semua">Semua bidang</option>{fields.map((name) => <option key={name} value={name}>{name}</option>)}</select>
        </div>
      </div>
    </div>
    {feedback && <div className={`rounded-xl border px-4 py-3 text-sm ${feedback.ok ? 'border-emerald-400/20 bg-emerald-400/5 text-emerald-300' : 'border-red-400/20 bg-red-400/5 text-red-300'}`}>{feedback.message}</div>}
    {filtered.length ? <div className="space-y-3">{filtered.map((item) => (
      <details key={item.id} className="card group overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-400/10 text-xs font-black text-sky-300">{item.field_number}.{item.item_number}</span>
          <div className="min-w-0 flex-1"><h2 className="font-bold text-white">{item.name}</h2><p className="mt-1 truncate text-xs text-slate-500">Bidang {item.field_number} · {item.field_name}</p></div>
          <div className="hidden gap-1 sm:flex">{levels.map((level) => <span key={level} className={`rounded-full px-2 py-1 text-[10px] font-bold ${rows[`${item.id}-${level}`]?.status === 'Lulus' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/5 text-slate-600'}`}>{level}</span>)}</div>
          <ChevronDown className="h-4 w-4 text-slate-600 transition group-open:rotate-180" />
        </summary>
        <div className="grid gap-3 border-t border-white/8 p-4 xl:grid-cols-3">{levels.map((level) => {
          const requirement = item.skk_requirements.find((row) => row.level === level)
          const key = `${item.id}-${level}`
          const row = rows[key]
          return <section key={level} className="rounded-xl border border-white/8 bg-black/10 p-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-amber-300">Tingkat {level}</h3><span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{row.status}</span></div>
            <p className="min-h-28 text-xs leading-5 text-slate-400">{requirement?.description ?? 'Persyaratan belum tersedia.'}</p>
            <div className="mt-4 flex flex-wrap gap-1">{statusOptions.map((status) => { const Icon = status === 'Lulus' ? CheckCircle2 : status === 'Proses' ? Clock3 : MinusCircle; return <button type="button" key={status} onClick={() => setRows((current) => ({ ...current, [key]: { ...current[key], status } }))} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${row.status === status ? 'bg-emerald-400 text-slate-950' : 'bg-white/5 text-slate-500'}`}><Icon className="h-3 w-3" />{status}</button> })}</div>
            <textarea className="input mt-3 min-h-20 py-2 text-xs" placeholder="Catatan pembina" value={row.note} onChange={(event) => setRows((current) => ({ ...current, [key]: { ...current[key], note: event.target.value } }))} />
            <button type="button" onClick={() => save(item.id, level)} disabled={isPending || !requirement} className="btn-secondary mt-3 w-full py-2 text-xs"><Save className="h-3.5 w-3.5" />Simpan {level}</button>
          </section>
        })}</div>
      </details>
    ))}</div> : <div className="card p-10 text-center text-sm text-slate-500">Tidak ada SKK yang cocok dengan pencarian.</div>}
  </div>
}
