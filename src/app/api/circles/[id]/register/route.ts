import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const circleId = id
    const supabase = await createClient()

    // 1. Verify authenticated user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to register for a circle.' }, 
        { status: 401 }
      )
    }

    // 2. Call our secure PostgreSQL stored procedure (handles capacity, duplicates, and race conditions)
    const { data, error } = await supabase.rpc('register_for_circle', {
      p_circle_id: circleId,
    })

    if (error) {
      // Map custom PostgreSQL error codes to meaningful HTTP responses
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const circleId = id
    const supabase = await createClient()

    // 1. Verify authenticated user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in.' }, 
        { status: 401 }
      )
    }

    // 2. Update registration status to cancelled (releases the seat)
    const { error } = await supabase
      .from('registrations')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('circle_id', circleId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'Registration cancelled successfully.' }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
