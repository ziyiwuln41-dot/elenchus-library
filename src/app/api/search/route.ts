import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { search } from "@/lib/search";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const key = sp.get("key");
  const keyOk = !!process.env.LOOKUP_KEY && key === process.env.LOOKUP_KEY;
  if (!keyOk) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const type = sp.get("type") ?? "papers";
  const n = Math.min(Number(sp.get("n") ?? 8) || 8, 20);
  // Several queries can be sent at once, separated by "|"; each returns its own results.
  const queries = (sp.get("q") ?? "").split("|").map((s) => s.trim()).filter(Boolean).slice(0, 25);
  if (!queries.length) return NextResponse.json({ results: [] });

  const results = await Promise.all(queries.map((q) => search(type, q, n).catch(() => [])));
  return NextResponse.json(queries.length === 1 ? { results: results[0] } : { batches: queries.map((q, i) => ({ q, results: results[i] })) });
}
