"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PageInfo } from "./types";

export default function ScrapbookHeader({
  id, title, theme, pages, currentPage, isOwner, canEdit, sharedWith,
}: {
  id: string; title: string; theme: string | null; pages: PageInfo[]; currentPage: string; isOwner: boolean; canEdit: boolean; sharedWith: React.ReactNode;
}) {
  const router = useRouter();
  const [name, setName] = useState(title);
  const supabase = createClient();

  async function saveTitle() {
    if (name.trim() && name.trim() !== title) {
      await supabase.from("scrapbooks").update({ title: name.trim() }).eq("id", id);
      router.refresh();
    }
  }
  async function addPage() {
    const pos = Math.max(-1, ...pages.map((p) => p.position)) + 1;
    const { data } = await supabase.from("scrapbook_pages").insert({ scrapbook_id: id, title: `Page ${pages.length + 1}`, position: pos }).select("id").single();
    if (data) router.push(`/scrapbooks/${id}?page=${data.id}`);
  }
  async function renamePage(p: PageInfo) {
    const t = prompt("Rename this page", p.title ?? "");
    if (t === null) return;
    await supabase.from("scrapbook_pages").update({ title: t.trim() || null }).eq("id", p.id);
    router.refresh();
  }
  async function deletePage(p: PageInfo) {
    if (pages.length <= 1) return alert("A scrapbook needs at least one page.");
    if (!confirm(`Delete "${p.title ?? "this page"}" and everything on it?`)) return;
    await supabase.from("scrapbook_pages").delete().eq("id", p.id);
    const next = pages.find((x) => x.id !== p.id)!;
    router.push(`/scrapbooks/${id}?page=${next.id}`);
  }
  async function deleteBook() {
    if (!confirm(`Delete the scrapbook "${title}" and all its pages?`)) return;
    await supabase.from("scrapbooks").delete().eq("id", id);
    router.push(`/scrapbooks${theme ? `?theme=${theme}` : ""}`);
  }

  const cur = pages.find((p) => p.id === currentPage);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 360px", minWidth: 0 }}>
          <Link href={`/scrapbooks${theme ? `?theme=${theme}` : ""}`} style={{ fontSize: 15 }}>← All scrapbooks</Link>
          <label htmlFor="sb-title" className="sr-only">Scrapbook title</label>
          <input
            id="sb-title" value={name} readOnly={!canEdit} onChange={(e) => setName(e.target.value)} onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            className="display"
            style={{ display: "block", width: "100%", fontSize: 40, background: "transparent", border: "none", borderBottom: canEdit ? "1px dashed rgba(90,58,34,.3)" : "none", padding: "4px 0", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {sharedWith}
          {isOwner && <button className="btn btn-ghost" style={{ color: "#7a2a1c", borderColor: "#7a2a1c" }} onClick={deleteBook}>Delete scrapbook</button>}
        </div>
      </div>
      <nav aria-label="Pages" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {pages.map((p) => {
          const on = p.id === currentPage;
          return (
            <Link
              key={p.id}
              href={`/scrapbooks/${id}?page=${p.id}`}
              aria-current={on ? "page" : undefined}
              style={{
                padding: "8px 16px", minHeight: 40, display: "inline-flex", alignItems: "center", borderRadius: "8px 8px 0 0", textDecoration: "none",
                background: on ? "var(--olive)" : "rgba(251,247,238,.8)", color: on ? "#F3EBDD" : "var(--olive)", border: "1px solid var(--olive-soft)", borderBottom: "none",
              }}
            >
              {p.title || "Untitled page"}
            </Link>
          );
        })}
        {canEdit && <button className="btn btn-ghost" style={{ minHeight: 40, padding: "6px 14px" }} onClick={addPage} aria-label="Add a page">+ Page</button>}
        {canEdit && cur && (
          <>
            <span style={{ flex: 1 }} />
            <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 12px", fontSize: 14 }} onClick={() => renamePage(cur)}>Rename page</button>
            <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 12px", fontSize: 14 }} onClick={() => deletePage(cur)}>Delete page</button>
          </>
        )}
      </nav>
    </div>
  );
}
