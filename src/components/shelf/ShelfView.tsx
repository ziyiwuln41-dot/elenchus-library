"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Spine from "@/components/Spine";
import ShelfRow from "@/components/ShelfRow";
import SourceCard from "./SourceCard";
import SourceDialog from "./SourceDialog";
import { spineLook, type AnalysisLine, type Excerpt, type ShelfKey, type Source } from "@/lib/sources";
import type { SpineColor, WoodKey } from "@/lib/style";

export default function ShelfView({
  theme, sources, excerpts, lines, wood, colors, shelfNames,
}: {
  theme: string; sources: Source[]; excerpts: Excerpt[]; lines: AnalysisLine[];
  wood: WoodKey; colors: SpineColor[]; shelfNames: Record<ShelfKey, string>;
}) {
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(null);
  const [dlg, setDlg] = useState<{ open: boolean; shelf: ShelfKey; editing: Source | null; key: number }>({ open: false, shelf: "books", editing: null, key: 0 });

  const selected = sources.find((s) => s.id === picked) ?? null;
  const openAdd = (shelf: ShelfKey) => setDlg((d) => ({ open: true, shelf, editing: null, key: d.key + 1 }));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}>
      <div style={{ flex: "999 1 760px", minWidth: 0, display: "flex", flexDirection: "column", gap: 44 }}>
        {(["books", "current", "research"] as ShelfKey[]).map((key) => {
          const row = sources.filter((s) => s.shelf === key);
          return (
            <section key={key} aria-labelledby={`sh-${key}`}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                <h2 id={`sh-${key}`} className="display" style={{ fontSize: 32, margin: 0 }}>{shelfNames[key]}</h2>
                <span style={{ fontSize: 15, fontStyle: "italic", color: "var(--umber)", background: "rgba(251,247,238,.6)", padding: "2px 8px", borderRadius: 3 }}>
                  {row.length} {row.length === 1 ? "volume" : "volumes"}
                  {key === "current" ? " · click a spine to read, the ✎ tab for your notes" : " · click a spine to open"}
                </span>
              </div>
              <ShelfRow wood={wood}>
                {row.map((s, i) => {
                  const look = spineLook(s, i, colors);
                  const linkOut = s.shelf === "current" && s.url ? s.url : null;
                  return (
                    <Spine
                      key={s.id}
                      title={s.title}
                      author={s.shelf === "current" ? s.publication || s.author : s.author}
                      {...look}
                      picked={picked === s.id}
                      href={linkOut}
                      onOpen={() => setPicked(s.id)}
                    />
                  );
                })}
                <div style={{ width: 26, flex: "none" }} />
                <button
                  type="button"
                  onClick={() => openAdd(key)}
                  aria-label={`Add to ${shelfNames[key]}`}
                  style={{
                    flex: "none", width: 44, height: 220, border: "2px dashed rgba(233,200,119,.55)", borderRadius: 4,
                    background: "rgba(0,0,0,.08)", color: "rgba(233,200,119,.9)", fontFamily: "var(--display)", fontSize: 30, cursor: "pointer",
                  }}
                >
                  +
                </button>
              </ShelfRow>
            </section>
          );
        })}
      </div>

      <div style={{ flex: "1 1 320px", minWidth: 0, position: "sticky", top: 16 }}>
        {selected ? (
          <SourceCard
            key={selected.id}
            source={selected}
            excerpts={excerpts.filter((x) => x.source_id === selected.id)}
            lines={lines}
            onEdit={() => setDlg((d) => ({ open: true, shelf: selected.shelf, editing: selected, key: d.key + 1 }))}
            onDeleted={() => { setPicked(null); router.refresh(); }}
            onChanged={() => router.refresh()}
          />
        ) : (
          <div className="card">
            <div className="tape" />
            <div className="caps">Source card</div>
            <p style={{ marginBottom: 0 }}>Choose a spine to see its excerpts and your analysis, or press <strong>+</strong> at the end of a shelf to add a source.</p>
          </div>
        )}
      </div>

      <SourceDialog
        key={dlg.key}
        open={dlg.open}
        theme={theme}
        shelf={dlg.shelf}
        editing={dlg.editing}
        onClose={() => setDlg((d) => ({ ...d, open: false }))}
        onSaved={(id) => { setDlg((d) => ({ ...d, open: false })); setPicked(id); router.refresh(); }}
      />
    </div>
  );
}
