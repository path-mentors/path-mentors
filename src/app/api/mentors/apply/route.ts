import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitMentorApplication } from '@/features/mentors/mentor.repository'
import { mentorApplicationSchema } from '@/features/mentors/mentor.validation'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate input data via Zod
    const validation = mentorApplicationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const application = await submitMentorApplication(supabase, validation.data)
    return NextResponse.json({ application }, { status: 201 })

  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized: You must be logged in to apply as a mentor.' }, { status: 401 })
    }
    if (err.message.startsWith('CONFLICT')) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}