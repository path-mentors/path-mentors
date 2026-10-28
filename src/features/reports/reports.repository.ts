import { createClient } from '@/lib/supabase/server'
import { CreateReportDTO } from './reports.validation'

export async function createSafetyReport(dto: CreateReportDTO) {
  const supabase = await createClient()

  // 1. Verify user identity
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('UNAUTHORIZED')
  }

  // 2. Determine initial severity (crisis reason automatically elevates severity)
  const finalSeverity = dto.reason === 'crisis_concern' ? 'crisis' : (dto.severity || 'medium')

  // 3. Insert report securely
  const { data, error } = await supabase
    .from('reports')
    .insert([
      {
        user_id: user.id,
        circle_id: dto.circle_id || null,
        reported_user_id: dto.reported_user_id || null,
        reason: dto.reason,
        details: dto.details?.trim() || null,
        severity: finalSeverity,
        status: 'open'
      }
    ])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}