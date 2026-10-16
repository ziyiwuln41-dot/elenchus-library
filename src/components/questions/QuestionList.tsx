"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createScrapbook } from "@/components/board/NewScrapbook";
import { THEMES } from "@/lib/style";

export type Question = {
  id: string; text: string; year: number | null; exam: string | null; school: string | null; theme: string | null;
  source_url: string | null; paraphrased: boolean; added_by: string | null;
};

export default function QuestionList({ questions, theme, me, isAdmin, existing }: {
  questions: Question[]; theme: string; me: string; isAdmin: boolean; existing: Record<string, string>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ text: "", year: String(new Date().getFullYear()), exam: "Prelim", school: "", theme, source_url: "" });
  const [err, setErr] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState("all");

  const years = [...new Set(questions.map((q) => q.year).filter(Boolean))].sort((a, b) => b! - a!) as number[];
  const shown = questions.filter((q) => yearFilter === "all" || String(q.year) === yearFilter);
  const byYear = new Map<string, Question[]>();
  for (const q of shown) {
    const k = q.year ? String(q.year) : "Undated";
    byYear.set(k, [...(byYear.get(k) ?? []), q]);
  }

  async function open(q: Question) {
    if (existing[q.id]) return router.push(`/scrapbooks/${existing[q.id]}`);
    setBusy(q.id);
    try {
      const id = await createScrapbook(q.text, q.theme ?? theme, q.id);
      router.push(`/scrapbooks/${id}`);
    } catch (x) {
      setErr((x as Error).message);
      setBusy(null);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.text.trim()) return;
    const { error } = await createClient().from("questions").insert({
      text: form.text.trim(), year: Number(form.year) || null, exam: form.exam.trim() || null, school: form.school.trim() || null,
      theme: form.theme, source_url: form.source_url.trim() || null, verified: false,
    });
    if (error) return setErr(error.message);
    setForm((f) => ({ ...f, text: "", source_url: "" }));
    setAdding(false);
    router.refresh();
  }

  async function remove(q: Question) {
    if (!confirm("Remove this question for everyone?")) return;
    await createClient().from("questions").delete().eq("id", q.id);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <label htmlFor="yf" className="caps">Year</label>
        <select id="yf" className="input" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{ minHeight: 40 }}>
          <option value="all">All years</option>
          {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
        </select>
        <span style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setAdding((a) => !a)}>{adding ? "Close" : "+ Add a question"}</button>
      </div>

      {adding && (
        <form onSubmit={add} className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="tape" />
          <p style={{ margin: 0 }}>Add a prelim or past-year question so everyone in the library can practise it.</p>
          <div className="field">
            <label htmlFor="q-text">Question</label>
            <textarea id="q-text" className="input" rows={2} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} required />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div className="field" style={{ flex: "1 1 100px" }}><label htmlFor="q-year">Year</label><input id="q-year" className="input" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} /></div>
            <div className="field" style={{ flex: "1 1 160px" }}>
              <label htmlFor="q-exam">Exam</label>
              <select id="q-exam" className="input" value={form.exam} onChange={(e) => setForm({ ...form, exam: e.target.value })}>
                <option>Prelim</option><option>Promo</option><option>A-Level GP</option><option>Class test</option>
              </select>
            </div>
            <div className="field" style={{ flex: "2 1 200px" }}><label htmlFor="q-school">School</label><input id="q-school" className="input" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} placeholder="e.g. Raffles Institution" /></div>
            <div className="field" style={{ flex: "2 1 200px" }}>
              <label htmlFor="q-theme">Theme</label>
              <select id="q-theme" className="input" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
                {THEMES.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label htmlFor="q-src">Where it&apos;s from (link, optional)</label><input id="q-src" className="input" type="url" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} /></div>
          {err && <p role="alert" style={{ margin: 0, color: "#7a2a1c" }}>{err}</p>}
          <button className="btn btn-primary" style={{ alignSelf: "flex-start" }}>Add question</button>
        </form>
      )}

      {err && !adding && <p role="alert" style={{ color: "#7a2a1c" }}>{err}</p>}

      {shown.length === 0 && (
        <div className="card">
          <div className="tape" />
          <p style={{ margin: 0 }}>
            No questions filed under this theme yet. {theme === "singapore" ? "Many questions ask about “your society”: look under Society & Culture and Politics & Governance too, or add your school’s prelim questions here." : "Add one from a prelim paper, or browse another theme."}
          </p>
        </div>
      )}

      {[...byYear.entries()].map(([year, qs]) => (
        <section key={year} aria-labelledby={`y-${year}`}>
          <h2 id={`y-${year}`} className="display" style={{ fontSize: 34, margin: "0 0 10px" }}>{year}</h2>
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {qs.map((q) => (
              <li key={q.id} className="card" style={{ padding: "18px 22px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 360px", minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: 24, lineHeight: 1.2, color: "var(--olive-deep)", fontWeight: 700 }}>{q.text}</div>
                  <div style={{ fontSize: 14, color: "var(--umber)", marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>{[q.exam, q.school].filter(Boolean).join(" · ")}</span>
                    {q.paraphrased && <span style={{ fontStyle: "italic" }}>Gist of the question; check the paper for exact wording</span>}
                    {q.source_url && <a href={q.source_url} target="_blank" rel="noopener noreferrer">Source ↗</a>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" disabled={busy === q.id} onClick={() => open(q)}>
                    {existing[q.id] ? "Open my scrapbook" : busy === q.id ? "Opening…" : "Plan in a scrapbook"}
                  </button>
                  {(q.added_by === me || (isAdmin && q.added_by === me)) && (
                    <button className="btn btn-ghost" onClick={() => remove(q)}>Remove</button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
