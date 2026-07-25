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
  const patrolRows = (patrols ?? []).map((patrol) => ({
    ...patrol,
    member_count: `${(members ?? []).filter((member) => member.patrol_id === patrol.id).length} orang`,
    leader_name: (members ?? []).find((member) => member.id === patrol.leader_member_id)?.name ?? '-',
    status_label: patrol.is_active ? 'Aktif' : 'Nonaktif',
  }))
  return <div><PageHeading eyebrow="Organisasi" title="Manajemen Regu" description="Bentuk regu putra/putri, pilih pemimpin dan wakil, lalu pantau jumlah anggota setiap regu." /><CrudManager entity="patrol" activeGudepId={context.activeGudep.id} items={patrolRows as Array<Record<string, unknown>>} createLabel="Tambah Regu" emptyTitle="Belum ada regu" emptyDescription="Buat regu pertama kemudian tetapkan anggota melalui menu Anggota." fields={[
    { name: 'name', label: 'Nama Regu', required: true }, { name: 'patrol_type', label: 'Jenis Regu', type: 'select', options: [{ label: 'Putra', value: 'Putra' }, { label: 'Putri', value: 'Putri' }] },
    { name: 'leader_member_id', label: 'Pemimpin Regu', type: 'select', options: memberOptions }, { name: 'vice_leader_member_id', label: 'Wakil Pemimpin', type: 'select', options: memberOptions },
    { name: 'color', label: 'Warna Regu', type: 'color' }, { name: 'is_active', label: 'Status', type: 'select', options: [{ label: 'Aktif', value: 'true' }, { label: 'Nonaktif', value: 'false' }] },
  ]} columns={[
    { key: 'name', label: 'Nama Regu' }, { key: 'patrol_type', label: 'Jenis' }, { key: 'member_count', label: 'Anggota' },
    { key: 'leader_name', label: 'Pemimpin' }, { key: 'status_label', label: 'Status' },
  ]} /></div>
}
