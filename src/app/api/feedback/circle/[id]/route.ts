// src/app/api/feedback/circle/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('feedback')
    .select('rating, confidence_before, confidence_after, registrations!inner(circle_id)')
    .eq('registrations.circle_id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (!data || data.length === 0) {
    return NextResponse.json({ average_rating: 0, average_confidence_change: 0, total_responses: 0 }, { status: 200 });
  }

  const totalRating = data.reduce((acc, curr) => acc + curr.rating, 0);
  const totalConfidenceChange = data.reduce((acc, curr) => acc + (curr.confidence_after - curr.confidence_before), 0);

  return NextResponse.json({
    average_rating: Number((totalRating / data.length).toFixed(2)),
    average_confidence_change: Number((totalConfidenceChange / data.length).toFixed(2)),
    total_responses: data.length,
  }, { status: 200 });
}
