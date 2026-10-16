"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Hit } from "@/lib/search";

const TYPES = [
  { key: "books", label: "Books" },
  { key: "papers", label: "Research" },
  { key: "news", label: "Current affairs" },
] as const;

export default function SearchPanel({ theme, onAdded, onClose, initialQuery }: { theme: string; onAdded: () => void; onClose: () => void; initialQuery: string }) {
  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState<(typeof TYPES)[number]["key"]>("papers");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [err, setErr] = useState<string | null>(null);

  async function run(e?: React.FormEvent, t = type) {
    e?.preventDefault();
    if (!q.trim()) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch(`/api/search?type=${t}&n=10&q=${encodeURIComponent(q.trim())}`);
      const j = await r.json();
      setHits(j.results ?? []);
    } catch {
      setErr("Search failed. Try again in a moment.");
    }
    setBusy(false);
  }

  async function add(h: Hit) {
    const shelf = h.type === "book" ? "books" : h.type === "paper" ? "research" : "current";
    const kind = h.type === "book" ? "book" : h.type === "paper" ? "paper" : "article";
    const { error } = await createClient().from("sources").insert({
      theme, shelf, kind, title: h.title, author: h.author, publication: h.publication, year: h.year,
      url: h.url, doi: h.doi, isbn: h.isbn, sort: 1000000,
    });
    if (error) return setErr(error.message);
    setAdded((s) => new Set(s).add(h.url ?? h.title));
    onAdded();
  }

  return (
    <section className="card" aria-label="Search for sources" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="tape" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div className="caps">Search the world&apos;s shelves</div>
        <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 12px", fontSize: 15 }} onClick={onClose}>Close</button>
      </div>
      <form onSubmit={run} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label htmlFor="sq" className="sr-only">Search terms</label>
        <input id="sq" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. social media and loneliness" autoFocus />
        <div role="tablist" aria-label="What to search" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TYPES.map((t) => (
            <button
              key={t.key} type="button" role="tab" aria-selected={type === t.key}
              onClick={() => { setType(t.key); if (q.trim()) run(undefined, t.key); }}
              style={{
                minHeight: 40, padding: "6px 14px", borderRadius: 999, cursor: "pointer",
                border: "1px solid var(--olive-soft)", background: type === t.key ? "var(--olive)" : "transparent", color: type === t.key ? "#F3EBDD" : "var(--olive)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" disabled={busy}>{busy ? "Searching…" : "Search"}</button>
      </form>

      {err && <p role="alert" style={{ margin: 0, color: "#7a2a1c" }}>{err}</p>}
      {hits && hits.length === 0 && (
        <p style={{ margin: 0 }}>
          {type === "news"
            ? "No articles came back. News search needs the Guardian or NYT key to be added; until then results are patchy."
            : "Nothing found. Try fewer or different words."}
        </p>
      )}
      {hits && hits.length > 0 && (
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12, maxHeight: "60vh", overflowY: "auto" }}>
          {hits.map((h, i) => {
            const id = h.url ?? h.title;
            const done = added.has(id);
            return (
              <li key={i} style={{ borderTop: "1px solid rgba(90,58,34,.2)", paddingTop: 10 }}>
                <div style={{ fontFamily: "var(--display)", fontSize: 20, fontWeight: 700, lineHeight: 1.15, color: "var(--olive-deep)" }}>
                  {h.url ? <a href={h.url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>{h.title}</a> : h.title}
                </div>
                <div style={{ fontSize: 15, fontStyle: "italic", color: "var(--umber)" }}>
                  {[h.author, h.publication, h.year].filter(Boolean).join(" · ")}
                </div>
                {h.snippet && <p style={{ margin: "4px 0 0", fontSize: 15 }}>{h.snippet}</p>}
                <button className="btn btn-ghost" disabled={done} onClick={() => add(h)} style={{ marginTop: 6, minHeight: 36, padding: "4px 12px", fontSize: 15 }}>
                  {done ? "On your shelf ✓" : "Add to shelf"}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
