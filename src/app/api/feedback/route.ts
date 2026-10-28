import { NextResponse } from 'next/server'
import { validateFeedback } from '@/features/feedback/feedback.validation'
import { submitStudentFeedback } from '@/features/feedback/feedback.repository'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Validate incoming data
    const validation = validateFeedback(body)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // 2. Submit feedback to repository
    const feedback = await submitStudentFeedback(body)

    return NextResponse.json({ success: true, feedback }, { status: 201 })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to submit feedback.' }, 
        { status: 401 }
      )
    }

    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 400 })
  }
}