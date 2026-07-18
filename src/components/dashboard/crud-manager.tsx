'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Edit3, Plus, Search, Trash2, X } from 'lucide-react'
import { deleteGudepAction, deleteMemberAction, deletePatrolAction, deleteTrainingAction, saveGudepAction, saveMemberAction, savePatrolAction, saveTrainingAction } from '@/app/actions/data'

export type Field = { name: string; label: string; type?: 'text' | 'textarea' | 'select' | 'date' | 'time' | 'color' | 'tel'; required?: boolean; placeholder?: string; options?: Array<{ label: string; value: string }>; wide?: boolean }
type Entity = 'gudep' | 'member' | 'patrol' | 'training'
type Props = { entity: Entity; items: Array<Record<string, unknown>>; fields: Field[]; columns: Array<{ key: string; label: string; render?: (item: Record<string, unknown>) => React.ReactNode }>; activeGudepId?: string; createLabel: string; emptyTitle: string; emptyDescription: string }
const saveActions = { gudep: saveGudepAction, member: saveMemberAction, patrol: savePatrolAction, training: saveTrainingAction }

export default function CrudManager({ entity, items, fields, columns, activeGudepId, createLabel, emptyTitle, emptyDescription }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const filtered = useMemo(() => { const search = query.toLowerCase(); return items.filter((item) => Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(search))) }, [items, query])
  const openCreate = () => { setEditing(null); setFeedback(null); setFormOpen(true) }
  const openEdit = (item: Record<string, unknown>) => { setEditing(item); setFeedback(null); setFormOpen(true) }

  const submit = (formData: FormData) => {
    if (editing?.id) formData.set('id', String(editing.id))
    if (activeGudepId) formData.set('gudep_id', activeGudepId)
    startTransition(async () => { const result = await saveActions[entity](formData); setFeedback(result); if (result.ok) { setFormOpen(false); setEditing(null); router.refresh() } })
  }

  const remove = (item: Record<string, unknown>) => {
    if (!window.confirm('Hapus data ini? Data yang berhubungan juga dapat ikut terhapus.')) return
    startTransition(async () => {
      const id = String(item.id)
      const result = entity === 'gudep' ? await deleteGudepAction(id) : entity === 'member' ? await deleteMemberAction(id, activeGudepId ?? '') : entity === 'patrol' ? await deletePatrolAction(id, activeGudepId ?? '') : await deleteTrainingAction(id, activeGudepId ?? '')
      setFeedback(result); if (result.ok) router.refresh()
    })
  }

  return <div className="space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari data..." className="input pl-10" /></label><button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" />{createLabel}</button></div>
    {feedback && <div className={`rounded-xl border px-4 py-3 text-sm ${feedback.ok ? 'border-emerald-400/20 bg-emerald-400/5 text-emerald-300' : 'border-red-400/20 bg-red-400/5 text-red-300'}`}>{feedback.message}</div>}
    {filtered.length === 0 ? <div className="card p-10 text-center"><h3 className="font-bold text-white">{emptyTitle}</h3><p className="mt-2 text-sm text-slate-500">{emptyDescription}</p></div> : <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-white/8 bg-white/[0.02] text-xs uppercase tracking-wider text-slate-500"><tr>{columns.map((column) => <th key={column.key} className="px-4 py-3 font-bold">{column.label}</th>)}<th className="px-4 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-white/5">{filtered.map((item) => <tr key={String(item.id)} className="text-slate-300 hover:bg-white/[0.02]">{columns.map((column) => <td key={column.key} className="px-4 py-3.5">{column.render ? column.render(item) : String(item[column.key] ?? '-')}</td>)}<td className="px-4 py-3.5"><div className="flex justify-end gap-2"><button aria-label="Edit" onClick={() => openEdit(item)} className="icon-button"><Edit3 className="h-4 w-4" /></button><button aria-label="Hapus" onClick={() => remove(item)} disabled={isPending} className="icon-button text-red-300"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div></div>}
    {formOpen && <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"><div className="my-6 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d1914] shadow-2xl"><div className="flex items-center justify-between border-b border-white/8 px-5 py-4"><div><h2 className="font-bold text-white">{editing ? 'Edit data' : createLabel}</h2><p className="text-xs text-slate-500">Pastikan data wajib sudah terisi dengan benar.</p></div><button aria-label="Tutup" onClick={() => setFormOpen(false)} className="icon-button"><X className="h-4 w-4" /></button></div><form action={submit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">{fields.map((field) => { const value = editing?.[field.name]; const common = { name: field.name, required: field.required, defaultValue: String(value ?? ''), placeholder: field.placeholder, className: 'input' }; return <label key={field.name} className={`space-y-1.5 ${field.wide ? 'sm:col-span-2' : ''}`}><span className="text-xs font-bold text-slate-400">{field.label}{field.required && ' *'}</span>{field.type === 'textarea' ? <textarea {...common} rows={3} /> : field.type === 'select' ? <select {...common}><option value="">Pilih...</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input {...common} type={field.type ?? 'text'} />}</label> })}<div className="flex justify-end gap-3 border-t border-white/8 pt-4 sm:col-span-2"><button type="button" onClick={() => setFormOpen(false)} className="btn-secondary">Batal</button><button disabled={isPending} className="btn-primary">{isPending ? 'Menyimpan...' : 'Simpan'}</button></div></form></div></div>}
  </div>
}
