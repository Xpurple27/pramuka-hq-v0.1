import AttendanceManager from '@/components/dashboard/attendance-manager'
import { EmptyGudep, PageHeading } from '@/components/dashboard/page-heading'
import { getDashboardContext } from '@/lib/scouthub-context'
import { createClient } from '@/utils/supabase/server'

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const context = await getDashboardContext()
  if (!context.activeGudep) return <><PageHeading title="Absensi" description="Catat kehadiran anggota." /><EmptyGudep /></>
  const supabase = await createClient()
  const gudepId = context.activeGudep.id
  const [{ data: sessions }, { data: members }, params] = await Promise.all([
    supabase.from('training_sessions').select('id,title,training_date').eq('gudep_id', gudepId).order('training_date', { ascending: false }),
    supabase.from('members').select('id,name,class_name,patrols(name)').eq('gudep_id', gudepId).eq('status', 'Aktif').order('name'),
    searchParams,
  ])
  const selectedSessionId = (sessions ?? []).some((item) => item.id === params.session) ? params.session! : sessions?.[0]?.id ?? ''
  const { data: attendance } = selectedSessionId ? await supabase.from('attendance').select('member_id,status,note').eq('training_session_id', selectedSessionId) : { data: [] }
  return <div><PageHeading eyebrow="Kehadiran" title="Absensi Latihan" description="Pilih pertemuan, tandai semua hadir untuk mempercepat, lalu ubah hanya anggota yang izin, sakit, atau alpa." /><AttendanceManager gudepId={gudepId} members={(members ?? []) as never[]} sessions={(sessions ?? []) as never[]} selectedSessionId={selectedSessionId} attendance={(attendance ?? []) as never[]} /></div>
}
