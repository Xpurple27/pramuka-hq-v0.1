import ReportCenter from '@/components/dashboard/report-center'
import { EmptyGudep, PageHeading } from '@/components/dashboard/page-heading'
import { getDashboardContext } from '@/lib/scouthub-context'
import { createClient } from '@/utils/supabase/server'
import { firstRelated } from '@/lib/relations'

export default async function ReportsPage() {
  const context = await getDashboardContext()
  if (!context.activeGudep) return <><PageHeading title="Laporan" description="Ekspor data pembinaan." /><EmptyGudep /></>
  const supabase = await createClient()
  const gudepId = context.activeGudep.id
  const [members, sessions, attendance, sku] = await Promise.all([
    supabase.from('members').select('name,student_number,nisn,gender,class_name,scout_level,status,parent_phone,patrols(name)').eq('gudep_id', gudepId).order('name'),
    supabase.from('training_sessions').select('training_date,title,start_time,end_time,location,material,objective,evaluation_notes').eq('gudep_id', gudepId).order('training_date'),
    supabase.from('attendance').select('status,note,members!inner(name,class_name,gudep_id),training_sessions!inner(title,training_date,gudep_id)').eq('members.gudep_id', gudepId).eq('training_sessions.gudep_id', gudepId),
    supabase.from('member_sku_progress').select('status,note,validated_at,members!inner(name,class_name,gudep_id),sku_items(item_number,title,level)').eq('members.gudep_id', gudepId),
  ])
  const datasets = [
    { name: 'anggota', label: 'Daftar Anggota', rows: (members.data ?? []).map((row) => ({ Nama: row.name, 'Nomor Induk': row.student_number, NISN: row.nisn, 'L/P': row.gender, Kelas: row.class_name, Regu: firstRelated(row.patrols)?.name ?? '', 'Tingkat SKU': row.scout_level, Status: row.status, 'HP Wali': row.parent_phone })) },
    { name: 'latihan', label: 'Riwayat Latihan', rows: (sessions.data ?? []).map((row) => ({ Tanggal: row.training_date, Kegiatan: row.title, Mulai: row.start_time, Selesai: row.end_time, Lokasi: row.location, Materi: row.material, Tujuan: row.objective, Evaluasi: row.evaluation_notes })) },
    { name: 'absensi', label: 'Rekap Absensi', rows: (attendance.data ?? []).map((row) => { const session = firstRelated(row.training_sessions); const member = firstRelated(row.members); return { Tanggal: session?.training_date ?? '', Pertemuan: session?.title ?? '', Nama: member?.name ?? '', Kelas: member?.class_name ?? '', Status: row.status, Catatan: row.note } }) },
    { name: 'sku', label: 'Progress SKU', rows: (sku.data ?? []).map((row) => { const member = firstRelated(row.members); const item = firstRelated(row.sku_items); return { Nama: member?.name ?? '', Kelas: member?.class_name ?? '', Tingkat: item?.level ?? '', Nomor: item?.item_number ?? '', Item: item?.title ?? '', Status: row.status, Catatan: row.note, 'Tanggal Validasi': row.validated_at } }) },
  ]
  return <div><PageHeading eyebrow="Administrasi" title="Pusat Laporan" description="Unduh data anggota, latihan, absensi, dan SKU sebagai CSV yang dapat langsung dibuka di Microsoft Excel atau Google Sheets." /><ReportCenter datasets={datasets} /></div>
}
