import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch circles the user is enrolled in by joining circle_participants with circles
  const { data: enrollments, error } = await supabase
    .from('circle_participants')
    .select(`
      id,
      created_at,
      circles (
        id,
        title,
        description,
        starts_at,
        ends_at,
        status,
        capacity,
        topics (
          name,
          category
        )
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ enrolled_circles: enrollments }, { status: 200 });
}