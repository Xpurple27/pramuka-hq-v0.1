import Link from 'next/link'
import SettingsForm from '@/components/dashboard/settings-form'
import { PageHeading } from '@/components/dashboard/page-heading'
import { getDashboardContext } from '@/lib/scouthub-context'
import { createClient } from '@/utils/supabase/server'

export default async function SettingsPage() {
  const context = await getDashboardContext()
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('phone').eq('id', context.userId).maybeSingle()
  return <div><PageHeading eyebrow="Akun" title="Pengaturan" description="Perbarui identitas pembina dan keamanan akun. Email dikelola melalui Supabase Authentication." /><SettingsForm fullName={context.fullName} email={context.email} phone={profile?.phone ?? ''} /><div className="card mt-5 max-w-2xl p-5"><h2 className="font-bold text-white">Keamanan akun</h2><p className="mt-1 text-sm text-slate-500">Kirim tautan reset ke email akun bila ingin mengganti kata sandi.</p><Link href="/forgot-password" className="btn-secondary mt-4 inline-flex">Atur ulang kata sandi</Link></div></div>
}
