'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export type AuthState = {
  error?: string | null
  success?: boolean
}

/**
 * Handles user login with email and password
 */
export async function loginAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan sistem saat login.' }
  }

  redirect('/dashboard')
}

/**
 * Handles user registration
 */
export async function signupAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const name = formData.get('name') as string
  const school = formData.get('school') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return { error: 'Nama, email, dan password wajib diisi.' }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          school: school || '',
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (data?.session) {
      redirect('/dashboard')
    }
  } catch (err: any) {
    // If it's a redirect error from next.js, let it throw normally
    if (err.digest?.startsWith('NEXT_REDIRECT')) {
      throw err
    }
    return { error: err.message || 'Terjadi kesalahan sistem saat mendaftar.' }
  }

  return {
    success: true,
    error: null,
  }
}

/**
 * Handles user logout
 */
export async function logoutAction() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (err) {
    console.error('Logout error:', err)
  }
  redirect('/login')
}
