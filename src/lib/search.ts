// Server-side search across free scholarly, book and news sources.

export type Hit = {
  type: "paper" | "book" | "article";
  title: string;
  author: string | null;
  year: string | null;
  publication: string | null;
  url: string | null;
  doi: string | null;
  isbn: string | null;
  snippet?: string | null;
};

const UA = { "User-Agent": "ElenchusLibrary/1.0 (mailto:ziyiwuln41@gmail.com)" };

function authorList(names: string[], max = 3) {
  if (!names.length) return null;
  return names.length > max ? `${names.slice(0, max).join(", ")} et al.` : names.join(", ");
}

export async function searchPapers(q: string, n = 8): Promise<Hit[]> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per-page=${n}&mailto=ziyiwuln41@gmail.com&select=id,doi,title,publication_year,authorships,primary_location,type,cited_by_count`;
  const r = await fetch(url, { headers: UA, next: { revalidate: 3600 } });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.results ?? []).map((w: {
    doi: string | null; title: string; publication_year: number | null; id: string;
    authorships: { author: { display_name: string } }[];
    primary_location: { source: { display_name: string } | null; landing_page_url: string | null } | null;
  }) => ({
    type: "paper" as const,
    title: w.title,
    author: authorList((w.authorships ?? []).map((a) => a.author.display_name)),
    year: w.publication_year ? String(w.publication_year) : null,
    publication: w.primary_location?.source?.display_name ?? null,
    doi: w.doi ? w.doi.replace(/^https?:\/\/doi\.org\//, "") : null,
    url: w.primary_location?.landing_page_url ?? w.id,
    isbn: null,
  }));
}

export async function searchBooks(q: string, n = 8): Promise<Hit[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${n}&fields=key,title,author_name,first_publish_year,isbn`;
  const r = await fetch(url, { headers: UA, next: { revalidate: 3600 } });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.docs ?? []).map((d: { key: string; title: string; author_name?: string[]; first_publish_year?: number; isbn?: string[] }) => ({
    type: "book" as const,
    title: d.title,
    author: authorList(d.author_name ?? []),
    year: d.first_publish_year ? String(d.first_publish_year) : null,
    publication: null,
    url: `https://openlibrary.org${d.key}`,
    doi: null,
    isbn: d.isbn?.find((x) => x.length === 13) ?? d.isbn?.[0] ?? null,
  }));
}

export async function searchGuardian(q: string, n = 8, fromDate?: string): Promise<Hit[]> {
  const key = process.env.GUARDIAN_API_KEY || "test";
  const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(q)}&page-size=${n}&order-by=relevance&type=article&show-fields=byline,trailText${fromDate ? `&from-date=${fromDate}` : ""}&api-key=${key}`;
  const r = await fetch(url, { next: { revalidate: 1800 } });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.response?.results ?? []).map((a: { webTitle: string; webUrl: string; webPublicationDate: string; fields?: { byline?: string; trailText?: string } }) => ({
    type: "article" as const,
    title: a.webTitle,
    author: a.fields?.byline ?? null,
    year: a.webPublicationDate?.slice(0, 4) ?? null,
    publication: "The Guardian",
    url: a.webUrl,
    doi: null,
    isbn: null,
    snippet: a.fields?.trailText?.replace(/<[^>]+>/g, "") ?? null,
  }));
}

export async function searchNYT(q: string, n = 8): Promise<Hit[]> {
  const key = process.env.NYT_API_KEY;
  if (!key) return [];
  const url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${encodeURIComponent(q)}&sort=relevance&api-key=${key}`;
  const r = await fetch(url, { next: { revalidate: 1800 } });
  if (!r.ok) return [];
  const j = await r.json();
  return (j.response?.docs ?? []).slice(0, n).map((d: { headline?: { main?: string }; web_url: string; pub_date?: string; byline?: { original?: string }; abstract?: string }) => ({
    type: "article" as const,
    title: d.headline?.main ?? "Untitled",
    author: shortByline(d.byline?.original?.replace(/^By\s+/i, "") ?? null),
    year: d.pub_date?.slice(0, 4) ?? null,
    publication: "The New York Times",
    url: d.web_url,
    doi: null,
    isbn: null,
    snippet: d.abstract ?? null,
  }));
}

// Respected outlets that GDELT (free, keyless news index) is restricted to.
export const OUTLETS: Record<string, string> = {
  "nytimes.com": "The New York Times", "economist.com": "The Economist", "theguardian.com": "The Guardian",
  "ft.com": "Financial Times", "theatlantic.com": "The Atlantic", "bbc.com": "BBC News", "bbc.co.uk": "BBC News",
  "reuters.com": "Reuters", "washingtonpost.com": "The Washington Post", "straitstimes.com": "The Straits Times",
  "channelnewsasia.com": "CNA", "technologyreview.com": "MIT Technology Review", "wired.com": "Wired",
  "foreignaffairs.com": "Foreign Affairs", "newyorker.com": "The New Yorker", "apnews.com": "AP News",
  "scmp.com": "South China Morning Post", "nature.com": "Nature", "vox.com": "Vox",
};

export async function searchGdelt(q: string, n = 8, opts: { domains?: string[]; start?: string } = {}): Promise<Hit[]> {
  const domains = opts.domains ?? Object.keys(OUTLETS);
  const dq = `(${domains.map((d) => `domainis:${d}`).join(" OR ")})`;
  const start = opts.start ?? "20220101000000";
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(`${q} ${dq} sourcelang:english`)}&mode=artlist&format=json&maxrecords=${Math.min(n * 4, 75)}&sort=hybridrel&startdatetime=${start}`;
  const r = await fetch(url, { headers: UA, next: { revalidate: 3600 } });
  if (!r.ok) return [];
  const text = await r.text();
  let j: { articles?: { url: string; title: string; seendate: string; domain: string }[] };
  try { j = JSON.parse(text); } catch { return []; }
  const seen = new Set<string>();
  const out: Hit[] = [];
  for (const a of j.articles ?? []) {
    const dom = a.domain.replace(/^www\./, "");
    const pub = OUTLETS[dom];
    const key = a.title.toLowerCase();
    if (!pub || seen.has(key)) continue;
    seen.add(key);
    out.push({
      type: "article", title: a.title, author: null, year: a.seendate?.slice(0, 4) ?? null,
      publication: pub, url: a.url, doi: null, isbn: null,
    });
    if (out.length >= n) break;
  }
  return out;
}

export async function searchNews(q: string, n = 8): Promise<Hit[]> {
  const [g, t, d] = await Promise.all([
    process.env.GUARDIAN_API_KEY ? searchGuardian(q, n).catch(() => []) : Promise.resolve([] as Hit[]),
    searchNYT(q, n).catch(() => []),
    searchGdelt(q, n).catch(() => []),
  ]);
  const out: Hit[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < Math.max(g.length, t.length, d.length); i++) {
    for (const h of [t[i], g[i], d[i]]) {
      if (h && h.url && !seen.has(h.url)) { seen.add(h.url); out.push(h); }
    }
  }
  return out.slice(0, n * 2);
}

export async function search(type: string, q: string, n = 8): Promise<Hit[]> {
  if (type === "papers") return searchPapers(q, n);
  if (type === "books") return searchBooks(q, n);
  if (type === "news") return searchNews(q, n);
  return [];
}

function shortByline(b: string | null) {
  if (!b) return null;
  const names = b.split(/,\s*|\s+and\s+/);
  return names.length > 3 ? `${names.slice(0, 3).join(", ")} et al.` : b;
}
