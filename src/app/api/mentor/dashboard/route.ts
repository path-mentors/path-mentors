// src/app/api/mentor/dashboard/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get mentor record for the authenticated user
  const { data: mentor } = await supabase.from('mentors').select('id').eq('user_id', user.id).single();
  if (!mentor) return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 });

  // Fetch circles assigned to this mentor with registration details
  const { data: circles, error } = await supabase
    .from('circles')
    .select('*, registrations(status, users(display_name))')
    .eq('mentor_id', mentor.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ circles }, { status: 200 });
}