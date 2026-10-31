// src/app/api/admin/mentors/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status"); // e.g. "pending"

    // 1. Authenticate the caller with the normal (RLS-bound) client.
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (profile.role !== "moderator" || profile.status !== "active") {
      return NextResponse.json(
        { error: "Forbidden: Moderator access required" },
        { status: 403 },
      );
    }

    // 2. Use the service-role client to read applications RLS would otherwise hide.
    const admin = createAdminClient();
    let query = admin
      .from("mentors")
      .select("*, users!user_id(display_name, email)")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);

    const { data: mentors, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ mentors }, { status: 200 });
  } catch (err) {
    const isMissingKey = err instanceof Error && err.message === "Supabase service-role environment variables are missing.";
    const message = isMissingKey
      ? "Server is missing the service-role key required for admin access."
      : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
