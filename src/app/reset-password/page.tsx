import { Compass } from 'lucide-react'
import { ResetPasswordForm } from '@/components/auth/password-form'

export default function ResetPasswordPage() {
  return <main className="grid min-h-screen place-items-center p-4"><div className="w-full max-w-md"><div className="mb-6 text-center"><Compass className="mx-auto mb-3 h-10 w-10 text-emerald-400" /><h1 className="text-2xl font-black text-white">Buat kata sandi baru</h1><p className="mt-2 text-sm text-emerald-100/50">Gunakan minimal delapan karakter.</p></div><ResetPasswordForm /></div></main>
}
