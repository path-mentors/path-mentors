// src/app/api/circles/[id]/enroll/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const circleId = resolvedParams.id;
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch circle details to verify existence and check capacity
  const { data: circle, error: circleError } = await supabase
    .from('circles')
    .select('capacity')
    .eq('id', circleId)
    .single();

  if (circleError || !circle) {
    return NextResponse.json({ error: 'Study circle not found' }, { status: 404 });
  }

  // 3. Count current enrollments
  const { count, error: countError } = await supabase
    .from('circle_participants')
    .select('*', { count: 'exact', head: true })
    .eq('circle_id', circleId);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 400 });
  }

  if (count !== null && count >= circle.capacity) {
    return NextResponse.json({ error: 'Study circle is full' }, { status: 400 });
  }

  // 4. Enroll the user
  const { data, error } = await supabase
    .from('circle_participants')
    .insert([{ circle_id: circleId, user_id: user.id }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation code
      return NextResponse.json({ error: 'You are already enrolled in this circle' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Successfully enrolled', participant: data }, { status: 201 });
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const circleId = resolvedParams.id;
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Remove the user from the circle participants table
  const { error } = await supabase
    .from('circle_participants')
    .delete()
    .eq('circle_id', circleId)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Successfully cancelled enrollment' }, { status: 200 });
}