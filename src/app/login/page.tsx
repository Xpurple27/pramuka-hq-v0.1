'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import { Compass, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { loginAction } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    error: null,
  })
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background ambient glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] h-[300px] w-[300px] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-4 animate-pulse">
            <Compass className="h-9 w-9" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Scout<span className="text-emerald-400">Hub</span>
          </h1>
          <p className="mt-2 text-sm text-emerald-100/60">
            Sistem Informasi & Manajemen Kegiatan Pramuka
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center sm:text-left">
            Masuk ke Akun Anda
          </h2>

          <form action={formAction} className="space-y-5">
            {/* Error Message */}
            {state?.error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 animate-in fade-in-50 duration-200">
                <div className="flex gap-2">
                  <span className="font-semibold">Gagal masuk:</span>
                  <span>{state.error}</span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-emerald-100/70">
                Alamat Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-100/40">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nama@gudep.id"
                  disabled={isPending}
                  className="custom-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-emerald-100/30"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-emerald-100/70">
                  Kata Sandi
                </label>
                <Link href="/forgot-password" className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300">Lupa kata sandi?</Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-100/40">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  disabled={isPending}
                  className="custom-input block w-full rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-emerald-100/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-100/40 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="glow-btn flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses Masuk...
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-emerald-100/50">Belum punya akun Pembina? </span>
            <Link
              href="/register"
              className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-4"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
