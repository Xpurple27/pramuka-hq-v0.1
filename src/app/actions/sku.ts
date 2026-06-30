'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { SKU_RAMU_SEED, SkuItem } from '@/utils/supabase/skuSeedData'

export type MemberSkuProgress = {
  sku_id: number
  point_number: number
  category: string
  description: string
  status: 'Belum' | 'Proses' | 'Lulus' | 'Revisi'
  notes: string
  updated_at?: string
}

/**
 * Get the full list of SKU items combined with progress for a specific member
 */
export async function getMemberSkuProgressAction(memberId: string) {
  try {
    const supabase = await createClient()

    // 1. Fetch all SKU templates (try DB first, fallback to TypeScript seeds if empty)
    let skus: SkuItem[] = []
    const { data: dbSkus, error: skuError } = await supabase
      .from('skus')
      .select('*')
      .order('point_number', { ascending: true })

    if (skuError || !dbSkus || dbSkus.length === 0) {
      skus = SKU_RAMU_SEED
    } else {
      skus = dbSkus
    }

    // 2. Fetch progress records for the given member
    const { data: progressRecords, error: progressError } = await supabase
      .from('member_skus')
      .select('*')
      .eq('member_id', memberId)

    if (progressError) throw progressError

    // 3. Map progress records into a fast lookup map
    const progressMap = new Map<number, { status: string; notes: string; updated_at?: string }>()
    if (progressRecords) {
      progressRecords.forEach((rec) => {
        progressMap.set(rec.sku_id, {
          status: rec.status,
          notes: rec.notes || '',
          updated_at: rec.updated_at
        })
      })
    }

    // 4. Combine templates and progress
    const combined: MemberSkuProgress[] = skus.map((sku) => {
      const prog = progressMap.get(sku.id)
      return {
        sku_id: sku.id,
        point_number: sku.point_number,
        category: sku.category,
        description: sku.description,
        status: (prog?.status as any) || 'Belum',
        notes: prog?.notes || '',
        updated_at: prog?.updated_at
      }
    })

    return { data: combined, error: null }
  } catch (err: any) {
    console.error('getMemberSkuProgressAction error:', err)
    return { data: null, error: err.message || 'Gagal mengambil progres SKU.' }
  }
}

/**
 * Upsert status and notes for a member's specific SKU point
 */
export async function updateMemberSkuStatusAction(
  memberId: string,
  skuId: number,
  status: 'Belum' | 'Proses' | 'Lulus' | 'Revisi',
  notes: string
) {
  try {
    const supabase = await createClient()

    // Upsert record (insert or update on duplicate member_id + sku_id)
    const { data, error } = await supabase
      .from('member_skus')
      .upsert(
        {
          member_id: memberId,
          sku_id: skuId,
          status,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'member_id,sku_id' }
      )
      .select()

    if (error) throw error

    revalidatePath(`/dashboard/sku/${memberId}`)
    return { success: true, data, error: null }
  } catch (err: any) {
    console.error('updateMemberSkuStatusAction error:', err)
    return { error: err.message || 'Gagal memperbarui status SKU.' }
  }
}
