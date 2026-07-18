import CrudManager from '@/components/dashboard/crud-manager'
import { EmptyGudep, PageHeading } from '@/components/dashboard/page-heading'
import { getDashboardContext } from '@/lib/scouthub-context'
import { createClient } from '@/utils/supabase/server'

export default async function TrainingPage() {
  const context = await getDashboardContext()
  if (!context.activeGudep) return <><PageHeading title="Latihan" description="Kelola agenda latihan." /><EmptyGudep /></>
  const supabase = await createClient()
  const { data } = await supabase.from('training_sessions').select('*').eq('gudep_id', context.activeGudep.id).order('training_date', { ascending: false })
  return <div><PageHeading eyebrow="Program Latihan" title="Jadwal & Riwayat Latihan" description="Dokumentasikan agenda, materi, tujuan, lokasi, dan evaluasi latihan rutin dalam satu riwayat." /><CrudManager entity="training" activeGudepId={context.activeGudep.id} items={(data ?? []) as Array<Record<string, unknown>>} createLabel="Buat Latihan" emptyTitle="Belum ada latihan" emptyDescription="Buat jadwal latihan agar absensi dapat mulai digunakan." fields={[
    { name: 'title', label: 'Judul Latihan', required: true }, { name: 'training_date', label: 'Tanggal', type: 'date', required: true }, { name: 'start_time', label: 'Waktu Mulai', type: 'time', required: true }, { name: 'end_time', label: 'Waktu Selesai', type: 'time' },
    { name: 'location', label: 'Lokasi', required: true }, { name: 'material', label: 'Materi', type: 'textarea', wide: true }, { name: 'objective', label: 'Tujuan', type: 'textarea', wide: true }, { name: 'description', label: 'Deskripsi Kegiatan', type: 'textarea', wide: true }, { name: 'evaluation_notes', label: 'Catatan Evaluasi', type: 'textarea', wide: true },
  ]} columns={[
    { key: 'training_date', label: 'Tanggal', render: (item) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(`${item.training_date}T00:00:00`)) }, { key: 'title', label: 'Kegiatan' }, { key: 'start_time', label: 'Waktu', render: (item) => `${String(item.start_time).slice(0, 5)}${item.end_time ? `–${String(item.end_time).slice(0, 5)}` : ''}` }, { key: 'location', label: 'Lokasi' }, { key: 'material', label: 'Materi' },
  ]} /></div>
}
