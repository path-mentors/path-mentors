// src/app/api/users/me/registrations/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the current user's registrations joined with circles + topics.
  const { data: registrations, error } = await supabase
    .from('registrations')
    .select(`
      id,
      status,
      created_at,
      attended_at,
      cancelled_at,
      circles (
        id,
        title,
        description,
        starts_at,
        ends_at,
        capacity,
        status,
        topics ( id, name, category ),
        mentors ( id, users ( display_name ) )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ registrations }, { status: 200 });
}
