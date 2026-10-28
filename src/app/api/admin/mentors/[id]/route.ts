// src/app/api/admin/mentors/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Authenticate user securely
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify admin/moderator role from public.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || (userData.role !== 'moderator' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden: Moderator/Admin access required' }, { status: 403 });
    }

    // 3. Parse request body
    const body = await request.json();
    const { status, rejection_reason } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid or missing status value' }, { status: 400 });
    }

    // 4. Update the mentor application status
    const { data: updatedMentor, error: updateError } = await supabase
      .from('mentors')
      .update({
        status,
        rejection_reason: status === 'rejected' ? rejection_reason || null : null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ mentor: updatedMentor }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}