export interface CreateReportDTO {
  circle_id?: string
  reported_user_id?: string
  reason: 'inappropriate_content' | 'harassment' | 'unsafe_advice' | 'impersonation' | 'privacy_concern' | 'crisis_concern' | 'other'
  details?: string
  severity?: 'low' | 'medium' | 'high' | 'crisis'
}

export function validateReport(data: Record<string, unknown>): { isValid: boolean; error?: string } {
  const validReasons = [
    'inappropriate_content', 'harassment', 'unsafe_advice',
    'impersonation', 'privacy_concern', 'crisis_concern', 'other'
  ]

  if (!data.reason || !validReasons.includes(data.reason as string)) {
    return { isValid: false, error: 'A valid report reason is required.' }
  }

  if (data.details && typeof data.details === 'string' && data.details.length > 2000) {
    return { isValid: false, error: 'Report details cannot exceed 2000 characters.' }
  }

  return { isValid: true }
}