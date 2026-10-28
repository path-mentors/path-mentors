// src/app/api/mentors/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const field = url.searchParams.get('field') || undefined;
  const language = url.searchParams.get('language') || undefined;

  const supabase = await createClient();
  
  // FIX: Added !user_id hint to resolve the ambiguous relationship error
  let query = supabase
    .from('mentors')
    .select('*, users!user_id(display_name)')
    .eq('status', 'approved');

  if (field) query = query.eq('field', field);
  if (language) query = query.contains('languages', [language]);

  const { data: mentors, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ mentors }, { status: 200 });
}