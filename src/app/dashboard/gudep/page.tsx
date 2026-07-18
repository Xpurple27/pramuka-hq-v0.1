import CrudManager from '@/components/dashboard/crud-manager'
import { PageHeading } from '@/components/dashboard/page-heading'
import { getDashboardContext } from '@/lib/scouthub-context'

export default async function GudepPage() {
  const context = await getDashboardContext()
  return <div><PageHeading eyebrow="Data Induk" title="Manajemen Gudep" description="Simpan identitas pangkalan, nomor gugus depan, jenjang, dan tahun ajaran. Gudep aktif menentukan data yang tampil di seluruh modul." /><CrudManager entity="gudep" items={context.gudep as unknown as Array<Record<string, unknown>>} createLabel="Tambah Gudep" emptyTitle="Belum ada gudep" emptyDescription="Tambahkan gudep pertama untuk memulai pengelolaan." fields={[
    { name: 'name', label: 'Nama Gudep', required: true, placeholder: 'Gudep 01.001–01.002' },
    { name: 'school_name', label: 'Nama Sekolah/Pangkalan', required: true, placeholder: 'SMP Negeri 1' },
    { name: 'gudep_number', label: 'Nomor Gudep', placeholder: '01.001–01.002' },
    { name: 'level', label: 'Golongan', type: 'select', options: ['Siaga', 'Penggalang', 'Penegak', 'Pandega'].map((value) => ({ label: value, value })) },
    { name: 'academic_year', label: 'Tahun Ajaran', placeholder: '2026/2027' },
    { name: 'is_active', label: 'Status', type: 'select', options: [{ label: 'Aktif', value: 'true' }, { label: 'Nonaktif', value: 'false' }] },
    { name: 'address', label: 'Alamat', type: 'textarea', wide: true },
  ]} columns={[
    { key: 'name', label: 'Gudep' }, { key: 'school_name', label: 'Pangkalan' }, { key: 'gudep_number', label: 'Nomor' }, { key: 'level', label: 'Golongan' }, { key: 'academic_year', label: 'Tahun Ajaran' },
  ]} /></div>
}
