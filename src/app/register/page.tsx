'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { Compass, User, Mail, Lock, School, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react'
import { signupAction } from '@/app/actions/auth'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signupAction, {
    error: null,
    success: false,
  })
  const [showPassword, setShowPassword] = useState(false)

  // Success view if sign up completed and requires verification
  if (state?.success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[20%] left-[10%] h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-[20%] right-[10%] h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-[120px]" />
        </div>

        <div className="w-full max-w-md text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Pendaftaran Berhasil!</h1>
          <p className="text-emerald-100/70 mb-8">
            Akun Anda telah berhasil dibuat. Silakan periksa email masuk Anda untuk memverifikasi akun sebelum masuk ke sistem.
          </p>
          <div className="glass-card rounded-2xl p-6">
            <Link
              href="/login"
              className="glow-btn flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400"
            >
              Kembali ke Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background ambient glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] mb-3">
            <Compass className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Daftar Scout<span className="text-emerald-400">Hub</span>
          </h1>
          <p className="mt-1 text-xs text-emerald-100/60">
            Mulai kelola pangkalan & regu pramuka Anda
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white mb-5 text-center sm:text-left">
            Buat Akun Pembina Baru
          </h2>

          <form action={formAction} className="space-y-4">
            {/* Error Message */}
            {state?.error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 animate-in fade-in-50 duration-200">
                <div className="flex gap-2">
                  <span className="font-semibold">Gagal mendaftar:</span>
                  <span>{state.error}</span>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-100/70">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-100/40">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Kak Ahmad"
                  disabled={isPending}
                  className="custom-input block w-full rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-emerald-100/30"
                />
              </div>
            </div>

            {/* School / Gudep */}
            <div className="space-y-1">
              <label htmlFor="school" className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-100/70">
                Pangkalan / Gugus Depan (Sekolah)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-100/40">
                  <School className="h-4 w-4" />
                </div>
                <input
                  id="school"
                  name="school"
                  type="text"
                  placeholder="SMP Negeri 1 Kota / Gudep 04.123"
                  disabled={isPending}
                  className="custom-input block w-full rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-emerald-100/30"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-100/70">
                Alamat Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-100/40">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="kak.ahmad@gudep.id"
                  disabled={isPending}
                  className="custom-input block w-full rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-emerald-100/30"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label htmlFor="password" className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-100/70">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-100/40">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 6 karakter"
                  disabled={isPending}
                  className="custom-input block w-full rounded-xl py-2.5 pl-9 pr-9 text-xs text-white placeholder-emerald-100/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-100/40 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="glow-btn flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mendaftarkan Akun...
                </>
              ) : (
                <>
                  Daftar Sebagai Pembina
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-5 text-center text-xs">
            <span className="text-emerald-100/50">Sudah memiliki akun? </span>
            <Link
              href="/login"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-4"
            >
              Masuk Disini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
