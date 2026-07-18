'use client'

import { useState, useTransition } from 'react'
import { updateProfileAction } from '@/app/actions/data'

export default function SettingsForm({ fullName, email, phone }: { fullName: string; email: string; phone: string }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const submit = (formData: FormData) => startTransition(async () => setFeedback(await updateProfileAction(formData)))
  return <form action={submit} className="card max-w-2xl space-y-5 p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5"><span className="text-xs font-bold text-slate-400">Nama Lengkap *</span><input name="full_name" required defaultValue={fullName} className="input" /></label><label className="space-y-1.5"><span className="text-xs font-bold text-slate-400">Email</span><input value={email} readOnly className="input opacity-60" /></label><label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-bold text-slate-400">Nomor Telepon</span><input name="phone" type="tel" defaultValue={phone} className="input" /></label></div>{feedback && <div className={`rounded-xl border px-4 py-3 text-sm ${feedback.ok ? 'border-emerald-400/20 bg-emerald-400/5 text-emerald-300' : 'border-red-400/20 bg-red-400/5 text-red-300'}`}>{feedback.message}</div>}<button disabled={isPending} className="btn-primary">{isPending ? 'Menyimpan...' : 'Simpan Profil'}</button></form>
}
