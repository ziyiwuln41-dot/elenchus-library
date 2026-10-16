"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export async function createScrapbook(title: string, theme: string, questionId?: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("scrapbooks")
    .insert({ title, theme, question_id: questionId ?? null })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create");
  await supabase.from("scrapbook_pages").insert({ scrapbook_id: data.id, title: "Page 1", position: 0 });
  return data.id as string;
}

export default function NewScrapbook({ theme }: { theme: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function make(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const id = await createScrapbook(title.trim(), theme);
      router.push(`/scrapbooks/${id}`);
    } catch (x) {
      setErr((x as Error).message);
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          minHeight: 280, border: "2px dashed var(--olive-soft)", borderRadius: "4px 10px 10px 4px", background: "rgba(251,247,238,.6)",
          color: "var(--olive)", fontFamily: "var(--display)", fontSize: 26, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        }}
      >
        <span style={{ fontSize: 48, lineHeight: 1 }}>+</span>
        New scrapbook
      </button>
    );
  }
  return (
    <form onSubmit={make} className="card" style={{ minHeight: 280, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
      <label htmlFor="nsb" className="caps">Scrapbook title</label>
      <input id="nsb" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Is technology making us lazy?" autoFocus />
      {err && <p role="alert" style={{ margin: 0, color: "#7a2a1c" }}>{err}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary" disabled={busy}>{busy ? "Making…" : "Create"}</button>
        <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
