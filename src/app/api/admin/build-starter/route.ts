import { NextResponse, type NextRequest } from "next/server";
import { createClient as createSb } from "@supabase/supabase-js";
import { STARTER } from "@/data/starter";
import { searchBooks, searchPapers, type Hit } from "@/lib/search";

export const maxDuration = 300;

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

function titleMatches(want: string, got: string) {
  const w = norm(want.split(":")[0]).split(" ").filter((x) => x.length > 2);
  const g = new Set(norm(got).split(" "));
  if (!w.length) return norm(got).includes(norm(want));
  const hit = w.filter((x) => g.has(x)).length;
  return hit / w.length >= 0.75;
}
function authorMatches(surname: string, got: string | null) {
  if (!surname) return true;
  if (!got) return false;
  return norm(got).includes(norm(surname).split(" ").pop()!);
}

async function resolve(list: string[], kind: "book" | "paper", requireInTitle?: string) {
  const found: Hit[] = [];
  const missed: string[] = [];
  await Promise.all(
    list.map(async (entry, i) => {
      const [title, surname = ""] = entry.split("|");
      const topicOnly = !!requireInTitle && kind === "paper";
      const q = kind === "book" ? `${title} ${surname}`.trim() : title;
      const hits = await (kind === "book" ? searchBooks(q, 5) : searchPapers(q, topicOnly ? 8 : 3)).catch(() => [] as Hit[]);
      const pick = hits.find((h) =>
        topicOnly
          ? norm(h.title).includes(requireInTitle!) && !found.some((f) => f.title === h.title)
          : titleMatches(title, h.title) && authorMatches(surname, h.author),
      );
      if (pick) found[i] = pick;
      else missed.push(entry);
    }),
  );
  return { found: found.filter(Boolean), missed };
}

async function guardian(topic: string, n: number, requireInTitle?: string): Promise<Hit[]> {
  const key = process.env.GUARDIAN_API_KEY || "test";
  const q = requireInTitle ? topic : topic;
  const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(q)}&from-date=2022-01-01&page-size=${n * 3}&order-by=relevance&show-fields=byline&api-key=${key}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const j = await r.json();
  const all: Hit[] = (j.response?.results ?? [])
    .filter((a: { type: string; sectionId: string }) => a.type === "article" && !["football", "sport", "film", "music"].includes(a.sectionId) || topic.includes("sport") || topic.includes("Olympics") || topic.includes("esports") || topic.includes("doping"))
    .map((a: { webTitle: string; webUrl: string; webPublicationDate: string; fields?: { byline?: string } }) => ({
      type: "article", title: a.webTitle, author: a.fields?.byline ?? null, year: a.webPublicationDate.slice(0, 4),
      publication: "The Guardian", url: a.webUrl, doi: null, isbn: null,
    }));
  const keep = requireInTitle ? all.filter((h) => norm(h.title).includes(requireInTitle) || norm(h.url ?? "").includes(requireInTitle)) : all;
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
    Promise.all(spec.news.map((t) => guardian(t, perTopic, spec.requireInTitle).catch(() => [] as Hit[]))),
  ]);
  const seen = new Set<string>();
  const news = newsLists.flat().filter((h) => (seen.has(h.url!) ? false : (seen.add(h.url!), true)));

  const items = [
    ...books.found.map((h, i) => ({ shelf: "books", kind: "book", ...pickFields(h), sort: i })),
    ...news.map((h, i) => ({ shelf: "current", kind: "article", ...pickFields(h), sort: i })),
    ...papers.found.map((h, i) => ({ shelf: "research", kind: "paper", ...pickFields(h), sort: i })),
  ];

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
