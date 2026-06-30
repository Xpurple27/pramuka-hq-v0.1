'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type Member = {
  id: string
  gudep_name: string
  name: string
  class: string
  gender: 'L' | 'P'
  regu?: string
  status: 'Aktif' | 'Alumni' | 'Cuti'
  notes?: string
  created_at?: string
}

/**
 * Fetch all members belonging to the active Gugus Depan (school)
 */
export async function getMembersAction(gudepName: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('gudep_name', gudepName)
      .order('name', { ascending: true })

    if (error) throw error
    return { data: data as Member[], error: null }
  } catch (err: any) {
    console.error('getMembersAction error:', err)
    return { data: null, error: err.message || 'Gagal mengambil data anggota.' }
  }
}

/**
 * Add a new member to the active Gugus Depan
 */
export async function addMemberAction(
  gudepName: string,
  dataInput: Omit<Member, 'id' | 'gudep_name' | 'created_at'>
) {
  const { name, class: className, gender, regu, status, notes } = dataInput

  if (!name || !className || !gender) {
    return { error: 'Nama, Kelas, dan Jenis Kelamin wajib diisi.' }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('members')
      .insert({
        gudep_name: gudepName,
        name,
        class: className,
        gender,
        regu: regu || null,
        status: status || 'Aktif',
        notes: notes || null,
      })
      .select()

    if (error) throw error
    revalidatePath('/dashboard/members')
    return { success: true, data, error: null }
  } catch (err: any) {
    console.error('addMemberAction error:', err)
    return { error: err.message || 'Gagal menambahkan anggota.' }
  }
}

/**
 * Update an existing member
 */
export async function updateMemberAction(
  id: string,
  gudepName: string,
  dataInput: Omit<Member, 'id' | 'gudep_name' | 'created_at'>
) {
  const { name, class: className, gender, regu, status, notes } = dataInput

  if (!name || !className || !gender) {
    return { error: 'Nama, Kelas, dan Jenis Kelamin wajib diisi.' }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('members')
      .update({
        name,
        class: className,
        gender,
        regu: regu || null,
        status: status || 'Aktif',
        notes: notes || null,
      })
      .eq('id', id)
      .eq('gudep_name', gudepName)
      .select()

    if (error) throw error
    revalidatePath('/dashboard/members')
    return { success: true, data, error: null }
  } catch (err: any) {
    console.error('updateMemberAction error:', err)
    return { error: err.message || 'Gagal memperbarui data anggota.' }
  }
}

/**
 * Delete a member
 */
export async function deleteMemberAction(id: string, gudepName: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)
      .eq('gudep_name', gudepName)

    if (error) throw error
    revalidatePath('/dashboard/members')
    return { success: true, error: null }
  } catch (err: any) {
    console.error('deleteMemberAction error:', err)
    return { error: err.message || 'Gagal menghapus anggota.' }
  }
}
