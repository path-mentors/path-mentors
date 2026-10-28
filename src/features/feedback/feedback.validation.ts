export interface CreateFeedbackDTO {
  registration_id: string
  feeling_before: number
  feeling_after: number
  connection_rating: number
  confidence_change: number
  next_step: string
  comment?: string
}

export function validateFeedback(data: any): { isValid: boolean; error?: string } {
  if (!data.registration_id) {
    return { isValid: false, error: 'Registration ID is required.' }
  }
  if (typeof data.feeling_before !== 'number' || data.feeling_before < 1 || data.feeling_before > 5) {
    return { isValid: false, error: 'Feeling before must be a number between 1 and 5.' }
  }
  if (typeof data.feeling_after !== 'number' || data.feeling_after < 1 || data.feeling_after > 5) {
    return { isValid: false, error: 'Feeling after must be a number between 1 and 5.' }
  }
  if (typeof data.connection_rating !== 'number' || data.connection_rating < 1 || data.connection_rating > 5) {
    return { isValid: false, error: 'Connection rating must be a number between 1 and 5.' }
  }
  if (typeof data.confidence_change !== 'number' || data.confidence_change < -2 || data.confidence_change > 2) {
    return { isValid: false, error: 'Confidence change must be between -2 and +2.' }
  }
  if (!data.next_step || typeof data.next_step !== 'string' || data.next_step.trim().length < 3) {
    return { isValid: false, error: 'One practical next step is required (at least 3 characters).' }
  }

  return { isValid: true }
}