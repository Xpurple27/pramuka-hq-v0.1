'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import type { ActionResult, AttendanceStatus, SkuStatus } from '@/types/scouthub'

const ok = (message: string): ActionResult => ({ ok: true, message })
const fail = (message: string): ActionResult => ({ ok: false, message })
const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim()
const nullable = (form: FormData, key: string) => text(form, key) || null

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Terjadi kesalahan yang tidak diketahui.'
}

async function authenticatedClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sesi berakhir. Silakan masuk kembali.')
  return { supabase, user }
}

async function ownsGudep(gudepId: string) {
  const { supabase, user } = await authenticatedClient()
  const { data } = await supabase
    .from('gudep')
    .select('id')
    .eq('id', gudepId)
    .eq('created_by', user.id)
    .maybeSingle()
  if (!data) throw new Error('Gudep tidak ditemukan atau bukan milik akun ini.')
  return { supabase, user }
}

export async function selectGudepAction(gudepId: string): Promise<ActionResult> {
  try {
    await ownsGudep(gudepId)
    const store = await cookies()
    store.set('scouthub_active_gudep', gudepId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
    revalidatePath('/dashboard', 'layout')
    return ok('Gudep aktif berhasil diganti.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function saveGudepAction(form: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await authenticatedClient()
    const id = text(form, 'id')
    const name = text(form, 'name')
    const schoolName = text(form, 'school_name')
    if (!name || !schoolName) return fail('Nama gudep dan nama sekolah wajib diisi.')

    const payload = {
      name,
      school_name: schoolName,
      gudep_number: nullable(form, 'gudep_number'),
      address: nullable(form, 'address'),
      level: text(form, 'level') || 'Penggalang',
      academic_year: text(form, 'academic_year') || '2026/2027',
      is_active: text(form, 'is_active') !== 'false',
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }

    const query = id
      ? supabase.from('gudep').update(payload).eq('id', id).eq('created_by', user.id)
      : supabase.from('gudep').insert(payload)
    const { data, error } = await query.select('id').single()
    if (error) throw error

    if (!id && data?.id) {
      const store = await cookies()
      store.set('scouthub_active_gudep', data.id, { httpOnly: true, sameSite: 'lax', path: '/' })
    }
    revalidatePath('/dashboard', 'layout')
    return ok(id ? 'Data gudep diperbarui.' : 'Gudep berhasil dibuat.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function deleteGudepAction(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await authenticatedClient()
    const { error } = await supabase.from('gudep').delete().eq('id', id).eq('created_by', user.id)
    if (error) throw error
    const store = await cookies()
    if (store.get('scouthub_active_gudep')?.value === id) store.delete('scouthub_active_gudep')
    revalidatePath('/dashboard', 'layout')
    return ok('Gudep dan seluruh data terkait berhasil dihapus.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function saveMemberAction(form: FormData): Promise<ActionResult> {
  try {
    const id = text(form, 'id')
    const gudepId = text(form, 'gudep_id')
    const name = text(form, 'name')
    const className = text(form, 'class_name')
    if (!gudepId || !name || !className) return fail('Gudep, nama, dan kelas wajib diisi.')
    const { supabase } = await ownsGudep(gudepId)
    const payload = {
      gudep_id: gudepId,
      name,
      student_number: nullable(form, 'student_number'),
      nisn: nullable(form, 'nisn'),
      gender: text(form, 'gender') || 'L',
      class_name: className,
      scout_level: text(form, 'scout_level') || 'Penggalang Ramu',
      patrol_id: nullable(form, 'patrol_id'),
      parent_phone: nullable(form, 'parent_phone'),
      status: text(form, 'status') || 'Aktif',
      notes: nullable(form, 'notes'),
      joined_at: text(form, 'joined_at') || new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    }
    const query = id
      ? supabase.from('members').update(payload).eq('id', id).eq('gudep_id', gudepId)
      : supabase.from('members').insert(payload)
    const { error } = await query
    if (error) throw error
    revalidatePath('/dashboard/members')
    revalidatePath('/dashboard/sku')
    return ok(id ? 'Data anggota diperbarui.' : 'Anggota berhasil ditambahkan.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function deleteMemberAction(id: string, gudepId: string): Promise<ActionResult> {
  try {
    const { supabase } = await ownsGudep(gudepId)
    const { error } = await supabase.from('members').delete().eq('id', id).eq('gudep_id', gudepId)
    if (error) throw error
    revalidatePath('/dashboard/members')
    return ok('Anggota berhasil dihapus.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function savePatrolAction(form: FormData): Promise<ActionResult> {
  try {
    const id = text(form, 'id')
    const gudepId = text(form, 'gudep_id')
    const name = text(form, 'name')
    if (!gudepId || !name) return fail('Gudep dan nama regu wajib diisi.')
    const { supabase } = await ownsGudep(gudepId)
    const payload = {
      gudep_id: gudepId,
      name,
      patrol_type: text(form, 'patrol_type') || 'Putra',
      leader_member_id: nullable(form, 'leader_member_id'),
      vice_leader_member_id: nullable(form, 'vice_leader_member_id'),
      color: text(form, 'color') || '#10b981',
      is_active: text(form, 'is_active') !== 'false',
      updated_at: new Date().toISOString(),
    }
    const query = id
      ? supabase.from('patrols').update(payload).eq('id', id).eq('gudep_id', gudepId)
      : supabase.from('patrols').insert(payload)
    const { error } = await query
    if (error) throw error
    revalidatePath('/dashboard/patrols')
    return ok(id ? 'Regu berhasil diperbarui.' : 'Regu berhasil dibuat.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function deletePatrolAction(id: string, gudepId: string): Promise<ActionResult> {
  try {
    const { supabase } = await ownsGudep(gudepId)
    const { error } = await supabase.from('patrols').delete().eq('id', id).eq('gudep_id', gudepId)
    if (error) throw error
    revalidatePath('/dashboard/patrols')
    return ok('Regu berhasil dihapus.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function assignMemberPatrolAction(memberId: string, patrolId: string | null, gudepId: string): Promise<ActionResult> {
  try {
    const { supabase } = await ownsGudep(gudepId)
    const { error } = await supabase
      .from('members')
      .update({ patrol_id: patrolId, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .eq('gudep_id', gudepId)
    if (error) throw error
    revalidatePath('/dashboard/patrols')
    revalidatePath('/dashboard/members')
    return ok('Penempatan regu anggota diperbarui.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function saveTrainingAction(form: FormData): Promise<ActionResult> {
  try {
    const id = text(form, 'id')
    const gudepId = text(form, 'gudep_id')
    const title = text(form, 'title')
    const trainingDate = text(form, 'training_date')
    if (!gudepId || !title || !trainingDate) return fail('Judul dan tanggal latihan wajib diisi.')
    const { supabase, user } = await ownsGudep(gudepId)
    const payload = {
      gudep_id: gudepId,
      title,
      training_date: trainingDate,
      start_time: text(form, 'start_time') || '14:00',
      end_time: nullable(form, 'end_time'),
      location: text(form, 'location') || 'Pangkalan',
      material: nullable(form, 'material'),
      objective: nullable(form, 'objective'),
      description: nullable(form, 'description'),
      evaluation_notes: nullable(form, 'evaluation_notes'),
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }
    const query = id
      ? supabase.from('training_sessions').update(payload).eq('id', id).eq('gudep_id', gudepId)
      : supabase.from('training_sessions').insert(payload)
    const { error } = await query
    if (error) throw error
    revalidatePath('/dashboard/training')
    revalidatePath('/dashboard')
    return ok(id ? 'Jadwal latihan diperbarui.' : 'Latihan berhasil dijadwalkan.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function deleteTrainingAction(id: string, gudepId: string): Promise<ActionResult> {
  try {
    const { supabase } = await ownsGudep(gudepId)
    const { error } = await supabase.from('training_sessions').delete().eq('id', id).eq('gudep_id', gudepId)
    if (error) throw error
    revalidatePath('/dashboard/training')
    return ok('Jadwal latihan beserta absensinya berhasil dihapus.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function saveAttendanceAction(
  sessionId: string,
  gudepId: string,
  rows: Array<{ memberId: string; status: AttendanceStatus; note?: string }>,
): Promise<ActionResult> {
  try {
    const { supabase } = await ownsGudep(gudepId)
    const { data: session } = await supabase
      .from('training_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('gudep_id', gudepId)
      .maybeSingle()
    if (!session) return fail('Sesi latihan tidak ditemukan.')
    if (!rows.length) return fail('Tidak ada data absensi untuk disimpan.')

    const payload = rows.map((row) => ({
      training_session_id: sessionId,
      member_id: row.memberId,
      status: row.status,
      note: row.note?.trim() || null,
      updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase
      .from('attendance')
      .upsert(payload, { onConflict: 'training_session_id,member_id' })
    if (error) throw error
    revalidatePath('/dashboard/attendance')
    revalidatePath('/dashboard')
    return ok('Absensi berhasil disimpan.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function saveSkuProgressAction(
  memberId: string,
  gudepId: string,
  skuItemId: number,
  status: SkuStatus,
  note: string,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await ownsGudep(gudepId)
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('id', memberId)
      .eq('gudep_id', gudepId)
      .maybeSingle()
    if (!member) return fail('Anggota tidak ditemukan.')
    const { error } = await supabase.from('member_sku_progress').upsert({
      member_id: memberId,
      sku_item_id: skuItemId,
      status,
      note: note.trim() || null,
      validated_by: status === 'Lulus' ? user.id : null,
      validated_at: status === 'Lulus' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'member_id,sku_item_id' })
    if (error) throw error
    revalidatePath(`/dashboard/sku/${memberId}`)
    revalidatePath('/dashboard/sku')
    return ok('Progress SKU berhasil diperbarui.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function updateProfileAction(form: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await authenticatedClient()
    const fullName = text(form, 'full_name')
    if (!fullName) return fail('Nama lengkap wajib diisi.')
    const { error: authError } = await supabase.auth.updateUser({ data: { full_name: fullName } })
    if (authError) throw authError
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      email: user.email,
      phone: nullable(form, 'phone'),
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
    revalidatePath('/dashboard', 'layout')
    return ok('Profil berhasil diperbarui.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    })
    if (error) throw error
    return ok('Tautan pengaturan ulang kata sandi telah dikirim.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}

export async function updatePasswordAction(password: string): Promise<ActionResult> {
  if (password.length < 8) return fail('Kata sandi minimal 8 karakter.')
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    return ok('Kata sandi berhasil diperbarui.')
  } catch (error) {
    return fail(errorMessage(error))
  }
}
