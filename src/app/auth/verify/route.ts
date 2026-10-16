import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const tokenHash = String(form.get("token_hash") ?? "");
  const type = (String(form.get("type") ?? "") || "email") as EmailOtpType;
  const code = String(form.get("code") ?? "");
  const supabase = await createClient();

  let ok = false;
  if (tokenHash) ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  else if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;

  return NextResponse.redirect(new URL(ok ? "/" : "/login?error=link", request.url), { status: 303 });
}
