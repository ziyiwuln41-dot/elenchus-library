"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { KINDS_BY_SHELF, type ShelfKey, type Source, type SourceKind } from "@/lib/sources";
import { SPINE_FONTS } from "@/lib/style";

type Draft = {
  shelf: ShelfKey; kind: SourceKind; title: string; author: string; publication: string; year: string;
  url: string; doi: string; isbn: string; spine_color: string; spine_font: string; customColor: boolean;
};

function fromSource(s: Source | null, shelf: ShelfKey): Draft {
  return {
    shelf: s?.shelf ?? shelf,
    kind: s?.kind ?? KINDS_BY_SHELF[s?.shelf ?? shelf][0].key,
    title: s?.title ?? "", author: s?.author ?? "", publication: s?.publication ?? "", year: s?.year ?? "",
    url: s?.url ?? "", doi: s?.doi ?? "", isbn: s?.isbn ?? "",
    spine_color: s?.spine_color ?? "#5A3A22", spine_font: s?.spine_font ?? "", customColor: !!s?.spine_color,
  };
}

type Lookup = { title: string; author: string; year: string; isbn: string };

export default function SourceDialog({
  open, onClose, theme, shelf, editing, onSaved,
}: {
  open: boolean; onClose: () => void; theme: string; shelf: ShelfKey; editing: Source | null; onSaved: (id: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [d, setD] = useState<Draft>(() => fromSource(editing, shelf));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [results, setResults] = useState<Lookup[] | null>(null);
  const [looking, setLooking] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  async function lookUp() {
    if (!d.title.trim()) return;
    setLooking(true);
    try {
      const r = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(d.title.trim())}&limit=5&fields=title,author_name,first_publish_year,isbn`);
      const j = await r.json();
      setResults(
        (j.docs ?? []).map((x: { title: string; author_name?: string[]; first_publish_year?: number; isbn?: string[] }) => ({
          title: x.title, author: (x.author_name ?? []).slice(0, 3).join(", "),
          year: x.first_publish_year ? String(x.first_publish_year) : "", isbn: x.isbn?.[0] ?? "",
        })),
      );
    } catch {
      setResults([]);
    }
    setLooking(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!d.title.trim()) return setErr("A title is needed.");
    setSaving(true); setErr(null);
    const row = {
      theme, shelf: d.shelf, kind: d.kind, title: d.title.trim(),
      author: d.author.trim() || null, publication: d.publication.trim() || null, year: d.year.trim() || null,
      url: d.url.trim() || null, doi: d.doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//, "") || null, isbn: d.isbn.trim() || null,
      spine_color: d.customColor ? d.spine_color : null, spine_text_color: null, spine_font: d.spine_font || null,
    };
    const supabase = createClient();
    const res = editing
      ? await supabase.from("sources").update(row).eq("id", editing.id).select("id").single()
      : await supabase.from("sources").insert({ ...row, sort: 1000000 }).select("id").single();
    setSaving(false);
    if (res.error) return setErr(res.error.message);
    onSaved(res.data.id as string);
  }

  const lbl = { letterSpacing: ".15em" };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="src-dlg-title"
      style={{ border: "none", padding: 0, background: "transparent", maxWidth: "min(640px, 94vw)", width: "100%" }}
    >
      <form onSubmit={save} className="card" style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "88vh", overflowY: "auto" }}>
        <div className="tape" />
        <h2 id="src-dlg-title" className="display" style={{ fontSize: 32, margin: 0 }}>{editing ? "Edit source" : "Add to the shelf"}</h2>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: "1 1 180px" }}>
            <label htmlFor="sd-shelf" style={lbl}>Shelf</label>
            <select id="sd-shelf" className="input" value={d.shelf} onChange={(e) => { const sh = e.target.value as ShelfKey; setD((x) => ({ ...x, shelf: sh, kind: KINDS_BY_SHELF[sh][0].key })); }}>
              <option value="books">Books</option>
              <option value="current">Current Affairs</option>
              <option value="research">Research &amp; Literature</option>
            </select>
          </div>
          <div className="field" style={{ flex: "1 1 180px" }}>
            <label htmlFor="sd-kind" style={lbl}>Type</label>
            <select id="sd-kind" className="input" value={d.kind} onChange={(e) => set("kind", e.target.value as SourceKind)}>
              {KINDS_BY_SHELF[d.shelf].map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="sd-title" style={lbl}>Title</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input id="sd-title" className="input" style={{ flex: 1 }} required value={d.title} onChange={(e) => set("title", e.target.value)} />
            {d.shelf === "books" && (
              <button type="button" className="btn btn-ghost" onClick={lookUp} disabled={looking}>{looking ? "…" : "Look up"}</button>
            )}
          </div>
          {results && (
            <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0, border: "1px solid rgba(90,58,34,.25)", borderRadius: 4, background: "#fff" }}>
              {results.length === 0 && <li style={{ padding: 10 }}>No matches found. Fill the details in by hand.</li>}
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => { setD((x) => ({ ...x, title: r.title, author: r.author || x.author, year: r.year || x.year, isbn: r.isbn || x.isbn })); setResults(null); }}
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "1px dashed rgba(90,58,34,.2)", padding: "8px 10px", cursor: "pointer", minHeight: 44 }}
                  >
                    <strong>{r.title}</strong> — {r.author || "unknown author"} {r.year && `(${r.year})`}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="field" style={{ flex: "2 1 240px" }}>
            <label htmlFor="sd-author" style={lbl}>Author(s)</label>
            <input id="sd-author" className="input" value={d.author} onChange={(e) => set("author", e.target.value)} />
          </div>
          <div className="field" style={{ flex: "1 1 100px" }}>
            <label htmlFor="sd-year" style={lbl}>Year</label>
            <input id="sd-year" className="input" value={d.year} onChange={(e) => set("year", e.target.value)} />
          </div>
        </div>

        {d.shelf !== "books" && (
          <div className="field">
            <label htmlFor="sd-pub" style={lbl}>{d.shelf === "research" ? "Journal / publisher" : "Publication"}</label>
            <input id="sd-pub" className="input" value={d.publication} onChange={(e) => set("publication", e.target.value)} placeholder={d.shelf === "research" ? "Science" : "The Economist"} />
          </div>
        )}

        <div className="field">
          <label htmlFor="sd-url" style={lbl}>Link</label>
          <input id="sd-url" className="input" type="url" value={d.url} onChange={(e) => set("url", e.target.value)} placeholder="https://" />
        </div>

        {d.shelf === "research" && (
          <div className="field">
            <label htmlFor="sd-doi" style={lbl}>DOI</label>
            <input id="sd-doi" className="input" value={d.doi} onChange={(e) => set("doi", e.target.value)} placeholder="10.1126/science.aap9559" />
          </div>
        )}
        {d.shelf === "books" && (
          <div className="field">
            <label htmlFor="sd-isbn" style={lbl}>ISBN</label>
            <input id="sd-isbn" className="input" value={d.isbn} onChange={(e) => set("isbn", e.target.value)} />
          </div>
        )}

        <fieldset style={{ border: "1px dashed rgba(90,58,34,.3)", borderRadius: 4, padding: 12, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <legend className="caps" style={{ padding: "0 6px" }}>Spine</legend>
          <label style={{ display: "flex", gap: 8, alignItems: "center", minHeight: 44 }}>
            <input type="checkbox" checked={d.customColor} onChange={(e) => set("customColor", e.target.checked)} />
            Own colour
          </label>
          {d.customColor && (
            <input type="color" aria-label="Spine colour" value={d.spine_color} onChange={(e) => set("spine_color", e.target.value)} style={{ width: 44, height: 44, border: "none", background: "none" }} />
          )}
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            Font
            <select className="input" value={d.spine_font} onChange={(e) => set("spine_font", e.target.value)} style={{ minHeight: 40, padding: "6px 10px" }}>
              <option value="">Automatic</option>
              {SPINE_FONTS.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f.split(",")[0].replace(/'/g, "")}</option>)}
            </select>
          </label>
        </fieldset>

        {err && <p role="alert" style={{ margin: 0, color: "#7a2a1c" }}>{err}</p>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : editing ? "Save" : "Shelve it"}</button>
        </div>
      </form>
    </dialog>
  );
}
