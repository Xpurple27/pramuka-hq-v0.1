'use client'

import { Download, Printer } from 'lucide-react'

type Dataset = { name: string; label: string; rows: Array<Record<string, string | number | null>> }

function escapeCsv(value: string | number | null) {
  const normalized = String(value ?? '')
  return `"${normalized.replaceAll('"', '""')}"`
}

function downloadCsv(dataset: Dataset) {
  if (!dataset.rows.length) return
  const headers = Object.keys(dataset.rows[0])
  const csv = '\uFEFF' + [headers.map(escapeCsv).join(','), ...dataset.rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${dataset.name}-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function ReportCenter({ datasets }: { datasets: Dataset[] }) {
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{datasets.map((dataset) => <div key={dataset.name} className="card p-5"><p className="text-xs font-bold uppercase tracking-wider text-emerald-400">{dataset.label}</p><p className="mt-3 text-3xl font-black text-white">{dataset.rows.length}</p><p className="mt-1 text-xs text-slate-500">baris data siap diekspor</p><button onClick={() => downloadCsv(dataset)} disabled={!dataset.rows.length} className="btn-secondary mt-5 w-full text-xs"><Download className="h-4 w-4" />Unduh CSV/Excel</button></div>)}</div><div className="card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"><div><h2 className="font-bold text-white">Cetak ringkasan dashboard</h2><p className="mt-1 text-xs text-slate-500">Gunakan dialog cetak browser untuk menyimpan sebagai PDF.</p></div><button onClick={() => window.print()} className="btn-primary"><Printer className="h-4 w-4" />Cetak / Simpan PDF</button></div></div>
}
