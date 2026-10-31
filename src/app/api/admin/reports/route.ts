import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. Check user authentication & role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Query open reports (RLS policy ensures only admin/moderator roles can fetch this)
    const { data: reports, error } = await supabase
      .from('reports')
      .select(`
        id,
        reason,
        details,
        severity,
        status,
        created_at,
        users!reports_user_id_fkey ( display_name )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ reports }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}