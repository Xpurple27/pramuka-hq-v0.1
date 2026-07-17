'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock3, MinusCircle, Save } from 'lucide-react'
import { saveSkuProgressAction } from '@/app/actions/data'
import type { SkuItem, SkuStatus } from '@/types/scouthub'

type Progress = { sku_item_id: number; status: SkuStatus; note: string | null }

export default function SkuProgressManager({ memberId, gudepId, items, progress }: { memberId: string; gudepId: string; items: SkuItem[]; progress: Progress[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const initial = Object.fromEntries(items.map((item) => { const saved = progress.find((row) => row.sku_item_id === item.id); return [item.id, { status: saved?.status ?? 'Belum', note: saved?.note ?? '' }] }))
  const [rows, setRows] = useState<Record<number, { status: SkuStatus; note: string }>>(initial)
  const passed = Object.values(rows).filter((row) => row.status === 'Lulus').length
  const percentage = items.length ? Math.round((passed / items.length) * 100) : 0

  const save = (itemId: number) => startTransition(async () => {
    const row = rows[itemId]
    const result = await saveSkuProgressAction(memberId, gudepId, itemId, row.status, row.note)
    setFeedback(result)
    if (result.ok) router.refresh()
  })

  return <div className="space-y-4">
    <div className="card p-5"><div className="mb-2 flex items-end justify-between"><div><p className="text-xs font-semibold text-slate-500">Progress SKU</p><p className="text-2xl font-black text-white">{percentage}%</p></div><p className="text-xs text-slate-400">{passed} dari {items.length} item lulus</p></div><div className="h-2.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400" style={{ width: `${percentage}%` }} /></div></div>
    {feedback && <div className={`rounded-xl border px-4 py-3 text-sm ${feedback.ok ? 'border-emerald-400/20 bg-emerald-400/5 text-emerald-300' : 'border-red-400/20 bg-red-400/5 text-red-300'}`}>{feedback.message}</div>}
    {items.length ? <div className="space-y-3">{items.map((item) => { const row = rows[item.id]; return <div key={item.id} className="card p-4"><div className="flex gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-xs font-black text-emerald-300">{item.item_number}</span><div className="min-w-0 flex-1"><p className="font-semibold text-white">{item.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p><div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center"><div className="flex gap-1">{(['Belum', 'Proses', 'Lulus'] as SkuStatus[]).map((status) => { const Icon = status === 'Lulus' ? CheckCircle2 : status === 'Proses' ? Clock3 : MinusCircle; return <button key={status} onClick={() => setRows((current) => ({ ...current, [item.id]: { ...current[item.id], status } }))} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${row.status === status ? 'bg-emerald-400 text-slate-950' : 'bg-white/5 text-slate-500'}`}><Icon className="h-3 w-3" />{status}</button> })}</div><input className="input py-2 text-xs lg:flex-1" placeholder="Catatan pembina" value={row.note} onChange={(event) => setRows((current) => ({ ...current, [item.id]: { ...current[item.id], note: event.target.value } }))} /><button onClick={() => save(item.id)} disabled={isPending} className="btn-secondary py-2 text-xs"><Save className="h-3.5 w-3.5" />Simpan</button></div></div></div></div> })}</div> : <div className="card p-10 text-center text-sm text-slate-500">Item SKU untuk tingkat ini belum tersedia. Jalankan seed pada skema Supabase.</div>}
  </div>
}
