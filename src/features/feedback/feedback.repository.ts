import { createClient } from '@/lib/supabase/server'
import { CreateFeedbackDTO } from './feedback.validation'

export async function submitStudentFeedback(dto: CreateFeedbackDTO) {
  const supabase = await createClient()

  // Verify authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('UNAUTHORIZED')
  }

  // Insert feedback (PostgreSQL RLS ensures student owns the registration)
  const { data, error } = await supabase
    .from('feedback')
    .insert([
      {
        registration_id: dto.registration_id,
        feeling_before: dto.feeling_before,
        feeling_after: dto.feeling_after,
        connection_rating: dto.connection_rating,
        confidence_change: dto.confidence_change,
        next_step: dto.next_step.trim(),
        comment: dto.comment?.trim() || null,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}