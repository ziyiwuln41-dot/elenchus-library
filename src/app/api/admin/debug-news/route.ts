import { NextResponse, type NextRequest } from "next/server";

// Temporary: shows raw responses from news providers to diagnose empty results.
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  if (!process.env.LOOKUP_KEY || sp.get("key") !== process.env.LOOKUP_KEY) return NextResponse.json({ error: "no" }, { status: 401 });
  const q = sp.get("q") ?? "artificial intelligence jobs";
  const variant = sp.get("v") ?? "1";
  const queries: Record<string, string> = {
    "1": `${q} (domainis:nytimes.com OR domainis:theguardian.com) sourcelang:english`,
    "2": `${q} domainis:nytimes.com`,
    "3": q,
  };
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(queries[variant])}&mode=artlist&format=json&maxrecords=5&sort=hybridrel${sp.get("start") ? `&startdatetime=${sp.get("start")}` : ""}`;
  const r = await fetch(url, { headers: { "User-Agent": "ElenchusLibrary/1.0" } });
  const text = await r.text();
  return NextResponse.json({ status: r.status, url, body: text.slice(0, 1500) });
}
