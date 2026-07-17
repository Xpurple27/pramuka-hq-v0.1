type Props = { eyebrow?: string; title: string; description: string; action?: React.ReactNode }

export function PageHeading({ eyebrow, title, description, action }: Props) {
  return <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">{eyebrow}</p>}<h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p></div>{action}</div>
}

export function EmptyGudep() {
  return <div className="rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-400/5 p-8 text-center"><h2 className="text-lg font-bold text-white">Buat gudep terlebih dahulu</h2><p className="mx-auto mt-2 max-w-md text-sm text-slate-400">Semua anggota, regu, latihan, absensi, dan SKU akan terhubung ke gudep aktif.</p><a href="/dashboard/gudep" className="mt-5 inline-flex rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950">Buat Gudep</a></div>
}
