// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
  display_name: z.string().min(2).optional(),
  interests: z.array(z.string()).optional(),
  main_challenge: z.string().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Try fetching from the public 'users' table using maybeSingle()
  let { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // If the profile row doesn't exist yet, auto-create it using auth metadata
  if (!profile) {
    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
    profile = newProfile;
  }

  return NextResponse.json({ user: profile }, { status: 200 });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = updateProfileSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.format() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('users')
    .update(validation.data)
    .eq('id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ user: data }, { status: 200 });
}