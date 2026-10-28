// src/app/api/circles/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const topic = url.searchParams.get('topic');
  const status = url.searchParams.get('status');

  const supabase = await createClient();
  
  // Explicitly specify the foreign key constraint for users under mentors
  let query = supabase.from('circles').select('*, topics(*), mentors(*, users!mentors_user_id_fkey(display_name))');

  if (topic) query = query.eq('topic_id', topic);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ circles: data }, { status: 200 });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify moderator role
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'moderator') {
    return NextResponse.json({ error: 'Forbidden: Moderator access required' }, { status: 403 });
  }

  const body = await request.json();
  const { data, error } = await supabase.from('circles').insert([body]).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ circle: data }, { status: 201 });
}