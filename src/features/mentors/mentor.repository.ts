import { SupabaseClient } from '@supabase/supabase-js'
import { MentorApplicationDTO } from './mentor.validation'

export async function submitMentorApplication(
  supabase: SupabaseClient, 
  dto: MentorApplicationDTO
) {
  // 1. Get current authenticated user securely
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('UNAUTHORIZED')
  }

  // 2. Prevent duplicate applications (Idempotency check)
  const { data: existingApplication, error: lookupError } = await supabase
    .from('mentors')
    .select('id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (lookupError) {
    throw new Error(`DATABASE_ERROR: ${lookupError.message}`)
  }

  if (existingApplication) {
    throw new Error('CONFLICT: You have already submitted a mentor application.')
  }

  // 3. Submit mentor record aligned with schema fields (current_position, status)
  const { data, error: insertError } = await supabase
    .from('mentors')
    .insert([
      {
        user_id: user.id,
        field: dto.field.trim(),
        current_position: dto.current_position.trim(), // Updated to match table schema
        languages: dto.languages,
        bio: dto.bio?.trim() || null,
        availability: dto.availability || null,
        status: 'pending'
      }
    ])
    .select()
    .single()

  if (insertError) {
    throw new Error(`DATABASE_ERROR: ${insertError.message}`)
  }

  return data
}

/**
 * Fetch mentors with explicit foreign key hint on users!user_id
 * to prevent PostgREST ambiguity errors.
 */
export async function getMentors(supabase: SupabaseClient, field?: string) {
  let query = supabase
    .from('mentors')
    .select(`
      *,
      users:users!user_id (
        id,
        display_name,
        email,
        role
      )
    `)

  if (field) {
    query = query.eq('field', field)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`DATABASE_ERROR: ${error.message}`)
  }

  return data
}