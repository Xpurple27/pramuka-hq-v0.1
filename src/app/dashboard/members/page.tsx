import CrudManager from '@/components/dashboard/crud-manager'
import { EmptyGudep, PageHeading } from '@/components/dashboard/page-heading'
import { getDashboardContext } from '@/lib/scouthub-context'
import { createClient } from '@/utils/supabase/server'

export default async function MembersPage() {
  const context = await getDashboardContext()
  if (!context.activeGudep) return <><PageHeading title="Anggota" description="Kelola data peserta didik pramuka." /><EmptyGudep /></>
  const supabase = await createClient()
  const [{ data: members }, { data: patrols }] = await Promise.all([
    supabase.from('members').select('*,patrols(name)').eq('gudep_id', context.activeGudep.id).order('name'),
    supabase.from('patrols').select('id,name').eq('gudep_id', context.activeGudep.id).eq('is_active', true).order('name'),
  ])
  return <div><PageHeading eyebrow="Peserta Didik" title="Manajemen Anggota" description="Tambah, cari, dan perbarui profil anggota. Data ini menjadi dasar pembagian regu, absensi, dan penilaian SKU." /><CrudManager entity="member" activeGudepId={context.activeGudep.id} items={(members ?? []) as Array<Record<string, unknown>>} createLabel="Tambah Anggota" emptyTitle="Belum ada anggota" emptyDescription="Masukkan anggota pertama atau gunakan form secara bertahap." fields={[
    { name: 'name', label: 'Nama Lengkap', required: true }, { name: 'student_number', label: 'Nomor Induk' }, { name: 'nisn', label: 'NISN' },
    { name: 'gender', label: 'Jenis Kelamin', type: 'select', required: true, options: [{ label: 'Laki-laki', value: 'L' }, { label: 'Perempuan', value: 'P' }] },
    { name: 'class_name', label: 'Kelas', required: true, placeholder: 'VII-A' }, { name: 'scout_level', label: 'Tingkat SKU', type: 'select', options: ['Penggalang Ramu', 'Penggalang Rakit', 'Penggalang Terap'].map((value) => ({ label: value, value })) },
    { name: 'patrol_id', label: 'Regu', type: 'select', options: (patrols ?? []).map((item) => ({ label: item.name, value: item.id })) },
    { name: 'parent_phone', label: 'Nomor HP Wali', type: 'tel' }, { name: 'joined_at', label: 'Tanggal Bergabung', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['Aktif', 'Cuti', 'Alumni'].map((value) => ({ label: value, value })) }, { name: 'notes', label: 'Catatan Pembina', type: 'textarea', wide: true },
  ]} columns={[
    { key: 'name', label: 'Nama' }, { key: 'class_name', label: 'Kelas' }, { key: 'gender', label: 'L/P' }, { key: 'scout_level', label: 'Tingkat' }, { key: 'patrols', label: 'Regu', render: (item) => (item.patrols as { name?: string } | null)?.name ?? '-' }, { key: 'status', label: 'Status' },
  ]} /></div>
}
