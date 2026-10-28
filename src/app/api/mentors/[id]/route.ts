// src/app/api/mentors/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mentors')
    .select('*, users(display_name, email)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
  return NextResponse.json({ mentor: data }, { status: 200 });
}
