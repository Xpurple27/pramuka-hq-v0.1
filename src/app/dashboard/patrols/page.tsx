import CrudManager from '@/components/dashboard/crud-manager'
import { EmptyGudep, PageHeading } from '@/components/dashboard/page-heading'
import { getDashboardContext } from '@/lib/scouthub-context'
import { createClient } from '@/utils/supabase/server'

export default async function PatrolsPage() {
  const context = await getDashboardContext()
  if (!context.activeGudep) return <><PageHeading title="Regu" description="Kelola kelompok anggota." /><EmptyGudep /></>
  const supabase = await createClient()
  const [{ data: patrols }, { data: members }] = await Promise.all([
    supabase.from('patrols').select('*').eq('gudep_id', context.activeGudep.id).order('name'),
    supabase.from('members').select('id,name,patrol_id').eq('gudep_id', context.activeGudep.id).eq('status', 'Aktif').order('name'),
  ])
  const memberOptions = (members ?? []).map((item) => ({ label: item.name, value: item.id }))
  return <div><PageHeading eyebrow="Organisasi" title="Manajemen Regu" description="Bentuk regu putra/putri, pilih pemimpin dan wakil, lalu pantau jumlah anggota setiap regu." /><CrudManager entity="patrol" activeGudepId={context.activeGudep.id} items={(patrols ?? []) as Array<Record<string, unknown>>} createLabel="Tambah Regu" emptyTitle="Belum ada regu" emptyDescription="Buat regu pertama kemudian tetapkan anggota melalui menu Anggota." fields={[
    { name: 'name', label: 'Nama Regu', required: true }, { name: 'patrol_type', label: 'Jenis Regu', type: 'select', options: [{ label: 'Putra', value: 'Putra' }, { label: 'Putri', value: 'Putri' }] },
    { name: 'leader_member_id', label: 'Pemimpin Regu', type: 'select', options: memberOptions }, { name: 'vice_leader_member_id', label: 'Wakil Pemimpin', type: 'select', options: memberOptions },
    { name: 'color', label: 'Warna Regu', type: 'color' }, { name: 'is_active', label: 'Status', type: 'select', options: [{ label: 'Aktif', value: 'true' }, { label: 'Nonaktif', value: 'false' }] },
  ]} columns={[
    { key: 'name', label: 'Nama Regu' }, { key: 'patrol_type', label: 'Jenis' }, { key: 'members', label: 'Anggota', render: (item) => `${(members ?? []).filter((member) => member.patrol_id === item.id).length} orang` },
    { key: 'leader_member_id', label: 'Pemimpin', render: (item) => (members ?? []).find((member) => member.id === item.leader_member_id)?.name ?? '-' }, { key: 'is_active', label: 'Status', render: (item) => item.is_active ? 'Aktif' : 'Nonaktif' },
  ]} /></div>
}
