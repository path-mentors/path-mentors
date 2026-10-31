import { NextResponse } from 'next/server'
import { validateReport } from '@/features/reports/reports.validation'
import { createSafetyReport } from '@/features/reports/reports.repository'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // 1. Validate input payload
    const validation = validateReport(body)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // 2. Create safety report
    const report = await createSafetyReport(body)

    return NextResponse.json(
      { success: true, message: 'Report submitted successfully.', report },
      { status: 201 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    if (message === 'UNAUTHORIZED') {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to submit a safety report.' },
        { status: 401 }
      )
    }

    return NextResponse.json({ error: message || 'Internal Server Error' }, { status: 400 })
  }
}