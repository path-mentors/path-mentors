// src/app/api/circles/[id]/reviews/route.ts
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
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse request body for rating and comment
  const body = await request.json();
  const { rating, comment } = body;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating is required and must be between 1 and 5' }, { status: 400 });
  }

  // 3. Insert review into database
  const { data, error } = await supabase
    .from('circle_reviews')
    .insert([
      {
        circle_id: circleId,
        user_id: user.id,
        rating,
        comment,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already reviewed this circle' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'Review submitted successfully', review: data }, { status: 201 });
}