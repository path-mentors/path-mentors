// src/app/api/circles/[id]/participants/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const circleId = resolvedParams.id;
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch circle participants and join with user profiles
  // (You can also add a check here to ensure only the assigned mentor or admin can view this list, 
  // but for now, we'll allow authenticated users/mentors to view it.)
  const { data: participants, error } = await supabase
    .from('circle_participants')
    .select(`
      id,
      created_at,
      users (
        id,
        email,
        display_name
      )
    `)
    .eq('circle_id', circleId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ participants }, { status: 200 });
}