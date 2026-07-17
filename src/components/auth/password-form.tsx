'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { requestPasswordResetAction, updatePasswordAction } from '@/app/actions/data'

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const submit = (formData: FormData) => startTransition(async () => setFeedback(await requestPasswordResetAction(String(formData.get('email') ?? ''))))
  return <form action={submit} className="glass-card space-y-5 rounded-2xl p-6"><label className="space-y-2"><span className="text-xs font-bold text-emerald-100/70">Alamat email</span><input name="email" type="email" required className="custom-input block w-full rounded-xl px-4 py-3 text-sm text-white" /></label>{feedback && <p className={`rounded-xl border p-3 text-sm ${feedback.ok ? 'border-emerald-400/20 text-emerald-300' : 'border-red-400/20 text-red-300'}`}>{feedback.message}</p>}<button disabled={isPending} className="glow-btn w-full rounded-xl bg-emerald-400 py-3 text-sm font-bold text-slate-950">{isPending ? 'Mengirim...' : 'Kirim Tautan Reset'}</button><Link href="/login" className="block text-center text-xs font-bold text-emerald-400">Kembali ke login</Link></form>
}

export function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null)
  const submit = (formData: FormData) => startTransition(async () => setFeedback(await updatePasswordAction(String(formData.get('password') ?? ''))))
  return <form action={submit} className="glass-card space-y-5 rounded-2xl p-6"><label className="space-y-2"><span className="text-xs font-bold text-emerald-100/70">Kata sandi baru</span><input name="password" type="password" minLength={8} required className="custom-input block w-full rounded-xl px-4 py-3 text-sm text-white" /></label>{feedback && <p className={`rounded-xl border p-3 text-sm ${feedback.ok ? 'border-emerald-400/20 text-emerald-300' : 'border-red-400/20 text-red-300'}`}>{feedback.message}</p>}<button disabled={isPending} className="glow-btn w-full rounded-xl bg-emerald-400 py-3 text-sm font-bold text-slate-950">{isPending ? 'Menyimpan...' : 'Simpan Kata Sandi'}</button>{feedback?.ok && <Link href="/dashboard" className="block text-center text-xs font-bold text-emerald-400">Kembali ke dashboard</Link>}</form>
}
