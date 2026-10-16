"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ANALYSIS_KINDS, citation, kindLabel, type AnalysisKind, type AnalysisLine, type Excerpt, type Source } from "@/lib/sources";

const KIND_COLOR: Record<AnalysisKind, string> = {
  proves: "#3F5A35", limits: "#8a5a1a", counter: "#6B2A2A", answers: "#2D3A52", note: "#5A3A22",
};

export default function SourceCard({
  source, excerpts, lines, onEdit, onDeleted, onChanged,
}: {
  source: Source; excerpts: Excerpt[]; lines: AnalysisLine[];
  onEdit: () => void; onDeleted: () => void; onChanged: () => void;
}) {
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lineFor, setLineFor] = useState<string | null>(null);
  const [lineKind, setLineKind] = useState<AnalysisKind>("proves");
  const [lineText, setLineText] = useState("");

  const supabase = createClient();

  async function addExcerpt(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    await supabase.from("excerpts").insert({ source_id: source.id, text: text.trim(), page: page.trim() || null });
    setBusy(false); setText(""); setPage(""); onChanged();
  }
  async function addLine(e: React.FormEvent, excerptId: string) {
    e.preventDefault();
    if (!lineText.trim()) return;
    await supabase.from("analysis_lines").insert({ excerpt_id: excerptId, kind: lineKind, text: lineText.trim() });
    setLineText(""); setLineFor(null); onChanged();
  }
  async function delExcerpt(id: string) {
    if (!confirm("Delete this excerpt and its analysis?")) return;
    await supabase.from("excerpts").delete().eq("id", id); onChanged();
  }
  async function delLine(id: string) {
    await supabase.from("analysis_lines").delete().eq("id", id); onChanged();
  }
  async function delSource() {
    if (!confirm(`Remove "${source.title}" and everything clipped from it?`)) return;
    await supabase.from("sources").delete().eq("id", source.id); onDeleted();
  }
  async function copyCite() {
    await navigator.clipboard.writeText(citation(source));
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  const link = source.doi ? `https://doi.org/${source.doi}` : source.url;
  const meta = [source.author, source.publication, source.year].filter(Boolean).join(" · ");

  return (
    <aside className="card" aria-label="Source card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="tape" />
      <div className="caps">{kindLabel(source.kind)}</div>
      <h3 className="display" style={{ fontSize: 30, lineHeight: 1.1, margin: 0 }}>{source.title}</h3>
      {meta && <div style={{ fontStyle: "italic", color: "var(--umber)" }}>{meta}</div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {link && <a className="btn btn-primary" href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Open source ↗</a>}
        <button className="btn btn-ghost" onClick={copyCite}>{copied ? "Copied" : "Copy citation"}</button>
        <button className="btn btn-ghost" onClick={onEdit}>Edit</button>
        <button className="btn btn-ghost" onClick={delSource} style={{ color: "#7a2a1c", borderColor: "#7a2a1c" }}>Remove</button>
      </div>

      <div className="caps" style={{ marginTop: 8 }}>Excerpts &amp; footnotes</div>
      {excerpts.length === 0 && <p style={{ margin: 0, color: "var(--umber)" }}>Nothing clipped yet. Add the lines worth keeping below.</p>}
      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        {excerpts.map((x) => {
          const mine = lines.filter((l) => l.excerpt_id === x.id);
          return (
            <li key={x.id} style={{ borderTop: "1px solid rgba(90,58,34,.2)", paddingTop: 12 }}>
              <blockquote style={{ margin: 0, paddingLeft: 12, borderLeft: "3px solid var(--gold)", whiteSpace: "pre-wrap" }}>
                {x.text}
                {x.page && <span style={{ display: "block", fontSize: 14, color: "var(--olive-soft)", marginTop: 4 }}>p. {x.page}</span>}
              </blockquote>
              {mine.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
                  {mine.map((l) => (
                    <li key={l.id} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <span style={{ fontSize: 12, fontFamily: "var(--caps)", letterSpacing: ".08em", color: "#fff", background: KIND_COLOR[l.kind], padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>
                        {ANALYSIS_KINDS.find((k) => k.key === l.kind)?.label}
                      </span>
                      <span style={{ fontFamily: "var(--hand)", fontSize: 21, lineHeight: 1.2, color: "#24324a", flex: 1 }}>{l.text}</span>
                      <button aria-label="Delete analysis line" onClick={() => delLine(l.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--olive-soft)", minWidth: 32, minHeight: 32 }}>×</button>
                    </li>
                  ))}
                </ul>
              )}
              {lineFor === x.id ? (
                <form onSubmit={(e) => addLine(e, x.id)} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                  <label className="sr-only" htmlFor={`lk-${x.id}`}>Kind of analysis</label>
                  <select id={`lk-${x.id}`} className="input" value={lineKind} onChange={(e) => setLineKind(e.target.value as AnalysisKind)}>
                    {ANALYSIS_KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
                  </select>
                  <label className="sr-only" htmlFor={`lt-${x.id}`}>Your analysis</label>
                  <textarea id={`lt-${x.id}`} className="input" rows={2} value={lineText} onChange={(e) => setLineText(e.target.value)} placeholder="Your line of analysis" autoFocus />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" style={{ minHeight: 40, padding: "6px 14px" }}>Add</button>
                    <button type="button" className="btn btn-ghost" style={{ minHeight: 40, padding: "6px 14px" }} onClick={() => setLineFor(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 12px", fontSize: 15 }} onClick={() => { setLineFor(x.id); setLineText(""); }}>+ Analysis line</button>
                  <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 12px", fontSize: 15, borderColor: "transparent" }} onClick={() => delExcerpt(x.id)}>Delete excerpt</button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <form onSubmit={addExcerpt} style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid rgba(90,58,34,.2)", paddingTop: 14 }}>
        <label htmlFor="ex-text" className="caps">New excerpt or footnote</label>
        <textarea id="ex-text" className="input" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste or type the passage" />
        <div style={{ display: "flex", gap: 8 }}>
          <label className="sr-only" htmlFor="ex-page">Page</label>
          <input id="ex-page" className="input" style={{ width: 120 }} value={page} onChange={(e) => setPage(e.target.value)} placeholder="Page" />
          <button className="btn btn-primary" style={{ flex: 1 }} disabled={busy}>{busy ? "Saving…" : "Clip it"}</button>
        </div>
      </form>
    </aside>
  );
}
