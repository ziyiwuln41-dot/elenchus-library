import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSb } from "@supabase/supabase-js";
import { STARTER } from "@/data/starter";
import { searchBooks, searchGuardian, searchPapers, type Hit } from "@/lib/search";

export const maxDuration = 300;

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

function titleMatches(want: string, got: string) {
  const gn = norm(got);
  if (/box set|boxed set|collection|summary of|study guide|workbook/.test(gn) || got.includes("/")) return false;
  const w = norm(want.split(":")[0]).split(" ").filter((x) => x.length > 2);
  const g = gn.split(" ");
  if (!w.length) return gn.includes(norm(want));
  const hit = w.filter((x) => g.includes(x)).length;
  return hit / w.length >= 0.75 && g.length <= w.length * 3 + 6;
}

// Run tasks a few at a time, retrying once, so the free APIs don't rate-limit us.
async function pool<T, R>(items: T[], size: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      try { out[i] = await fn(items[i], i); }
      catch { await new Promise((r) => setTimeout(r, 800)); out[i] = await fn(items[i], i).catch(() => undefined as R); }
    }
  }
  await Promise.all(Array.from({ length: size }, worker));
  return out;
}
function authorMatches(surname: string, got: string | null) {
  if (!surname) return true;
  if (!got) return false;
  return norm(got).includes(norm(surname).split(" ").pop()!);
}

async function resolve(list: string[], kind: "book" | "paper", requireInTitle?: string) {
  const found: Hit[] = [];
  const missed: string[] = [];
  await pool(list, 4, async (entry, i) => {
      const [title, surname = ""] = entry.split("|");
      const topicOnly = !!requireInTitle && kind === "paper";
      const q = kind === "book" ? `${title} ${surname}`.trim() : title;
      let hits = await (kind === "book" ? searchBooks(q, 5) : searchPapers(q, topicOnly ? 8 : 3)).catch(() => [] as Hit[]);
      if (!hits.length) {
        await new Promise((r) => setTimeout(r, 1000));
        hits = await (kind === "book" ? searchBooks(q, 5) : searchPapers(q, topicOnly ? 8 : 3)).catch(() => [] as Hit[]);
      }
      const pick = hits.find((h) =>
        topicOnly
          ? norm(h.title).includes(requireInTitle!) && !found.some((f) => f.title === h.title)
          : titleMatches(title, h.title) && authorMatches(surname, h.author),
      );
      if (pick && !found.some((f) => f && norm(f.title) === norm(pick.title))) found[i] = pick;
      else if (pick) return;
      else missed.push(entry);
  });
  return { found: found.filter(Boolean), missed };
}

async function newsFor(topic: string, n: number, requireInTitle?: string): Promise<Hit[]> {
  const hits = await searchGuardian(topic, n * 3, "2022-01-01");
  await new Promise((r) => setTimeout(r, 1100)); // Guardian developer keys allow about one request a second
  const keep = requireInTitle ? hits.filter((h) => norm(h.title).includes(requireInTitle) || norm(h.url ?? "").includes(requireInTitle)) : hits;
  return keep.slice(0, n);
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  if (!process.env.LOOKUP_KEY || sp.get("key") !== process.env.LOOKUP_KEY) return NextResponse.json({ error: "no" }, { status: 401 });
  const theme = sp.get("theme") ?? "";
  const spec = STARTER[theme];
  if (!spec) return NextResponse.json({ error: "unknown theme" }, { status: 400 });
  const perTopic = Number(sp.get("perTopic") ?? 3);

  const [books, papers, newsLists] = await Promise.all([
    resolve(spec.books, "book"),
    resolve(spec.papers, "paper", spec.requireInTitle),
    sp.get("news") === "1" ? pool(spec.news, 1, (t) => newsFor(t, perTopic, spec.requireInTitle).catch(() => [] as Hit[])) : Promise.resolve([] as Hit[][]),
  ]);
  const seen = new Set<string>();
  const news = newsLists.flat().filter((h) => (seen.has(h.url!) ? false : (seen.add(h.url!), true)));

  const dedupe = <T extends { shelf: string; title: string }>(arr: T[]) => {
    const seen = new Set<string>();
    return arr.filter((x) => { const k = x.shelf + norm(x.title); if (seen.has(k)) return false; seen.add(k); return true; });
  };
  const items = dedupe([
    ...books.found.map((h, i) => ({ shelf: "books", kind: "book", ...pickFields(h), sort: i })),
    ...news.map((h, i) => ({ shelf: "current", kind: "article", ...pickFields(h), sort: i })),
    ...papers.found.map((h, i) => ({ shelf: "research", kind: "paper", ...pickFields(h), sort: i })),
  ]);

  let written = 0;
  let writeError: string | null = null;
  if (sp.get("write") === "1") {
    const sb = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
    const { data, error } = await sb.rpc("put_starter", { secret: process.env.SEED_SECRET, p_theme: theme, items });
    written = (data as number) ?? 0;
    writeError = error?.message ?? null;
  }

  return NextResponse.json({
    theme,
    counts: { books: books.found.length, current: news.length, research: papers.found.length },
    missed: { books: books.missed, papers: papers.missed },
    written, writeError,
    sample: sp.get("verbose") === "1" ? items : undefined,
  });
}

function pickFields(h: Hit) {
  return {
    title: h.title.slice(0, 300), author: h.author, publication: h.publication, year: h.year,
    url: h.url, doi: h.doi, isbn: h.isbn,
  };
}
