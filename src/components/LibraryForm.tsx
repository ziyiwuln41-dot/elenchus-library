"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PALETTES, WOODS, SPINE_FONTS, paletteColors, spineColorFor, type PaletteKey, type WoodKey } from "@/lib/style";
import type { Profile } from "@/lib/profile";
import Spine from "./Spine";
import ShelfRow from "./ShelfRow";

const SAMPLE = [
  ["The Republic", "Plato"], ["Justice", "Sandel"], ["The Shallows", "Carr"], ["Silent Spring", "Carson"],
  ["Ways of Seeing", "Berger"], ["Bowling Alone", "Putnam"], ["Poor Economics", "Banerjee & Duflo"],
  ["How Democracies Die", "Levitsky & Ziblatt"], ["Being Mortal", "Gawande"], ["The Tyranny of Merit", "Sandel"],
];

const DEFAULT_CUSTOM = ["#3F4A2A", "#5A3A22", "#C4932F", "#E6DCC6", "#6B2A2A", "#2D3A52"];

export default function LibraryForm({ profile, mode }: { profile: Profile; mode: "setup" | "settings" }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [libraryName, setLibraryName] = useState(profile.library_name ?? "");
  const [wood, setWood] = useState<WoodKey>(profile.wood ?? "walnut");
  const [palette, setPalette] = useState<PaletteKey>(profile.palette ?? "klimt");
  const [custom, setCustom] = useState<string[]>(profile.palette_custom?.length ? profile.palette_custom : DEFAULT_CUSTOM);
  const [shelves, setShelves] = useState({
    books: profile.shelf_names?.books ?? "",
    current: profile.shelf_names?.current ?? "",
    research: profile.shelf_names?.research ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const colors = paletteColors(palette, custom);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        library_name: libraryName.trim() || null,
        wood,
        palette,
        palette_custom: palette === "custom" ? custom : null,
        shelf_names: shelves,
        onboarded: true,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) return setMsg(error.message);
    if (mode === "setup") router.push("/");
    else { setMsg("Saved."); router.refresh(); }
  }

  const swatch = (on: boolean) => ({
    border: on ? "2px solid var(--olive-deep)" : "1px solid rgba(90,58,34,.3)",
    background: "var(--paper-light)", borderRadius: 6, padding: 10, cursor: "pointer",
    display: "flex", flexDirection: "column" as const, gap: 8, minHeight: 44, textAlign: "left" as const,
  });

  return (
    <form onSubmit={save} style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}>
      <div className="card" style={{ flex: "1 1 380px", display: "flex", flexDirection: "column", gap: 22 }}>
        <div className="tape" />
        <div className="field">
          <label htmlFor="dn">Your name</label>
          <input id="dn" className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ziyi" />
        </div>
        <div className="field">
          <label htmlFor="ln">Name your library</label>
          <input id="ln" className="input" value={libraryName} onChange={(e) => setLibraryName(e.target.value)} placeholder="The Elenchus Library" />
        </div>

        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend className="caps" style={{ marginBottom: 8 }}>Shelf wood</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {(Object.keys(WOODS) as WoodKey[]).map((k) => (
              <button type="button" key={k} onClick={() => setWood(k)} aria-pressed={wood === k} style={swatch(wood === k)}>
                <span style={{ height: 18, borderRadius: 2, background: WOODS[k].plank, borderTop: `2px solid ${WOODS[k].lip}` }} />
                <span>{WOODS[k].name}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend className="caps" style={{ marginBottom: 8 }}>Book colours</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {(Object.keys(PALETTES) as Exclude<PaletteKey, "custom">[]).map((k) => (
              <button type="button" key={k} onClick={() => setPalette(k)} aria-pressed={palette === k} style={swatch(palette === k)}>
                <span style={{ display: "flex", height: 18 }}>
                  {PALETTES[k].colors.slice(0, 8).map((c, i) => <span key={i} style={{ flex: 1, background: c.bg }} />)}
                </span>
                <span>{PALETTES[k].name}</span>
              </button>
            ))}
            <button type="button" onClick={() => setPalette("custom")} aria-pressed={palette === "custom"} style={swatch(palette === "custom")}>
              <span style={{ display: "flex", height: 18 }}>
                {custom.map((c, i) => <span key={i} style={{ flex: 1, background: c }} />)}
              </span>
              <span>My own colours</span>
            </button>
          </div>
          {palette === "custom" && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              {custom.map((c, i) => (
                <label key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 13 }}>
                  <input
                    type="color" value={c} aria-label={`Colour ${i + 1}`}
                    onChange={(e) => setCustom((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                    style={{ width: 44, height: 44, border: "none", background: "none", cursor: "pointer" }}
                  />
                  {i + 1}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset style={{ border: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <legend className="caps" style={{ marginBottom: 8 }}>Shelf names (optional)</legend>
          {([["books", "Books"], ["current", "Current Affairs"], ["research", "Research & Literature"]] as const).map(([k, d]) => (
            <div className="field" key={k}>
              <label htmlFor={`sh-${k}`} style={{ letterSpacing: ".15em" }}>{d}</label>
              <input id={`sh-${k}`} className="input" placeholder={d} value={shelves[k]} onChange={(e) => setShelves((s) => ({ ...s, [k]: e.target.value }))} />
            </div>
          ))}
        </fieldset>

        {msg && <p role="status" style={{ margin: 0 }}>{msg}</p>}
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : mode === "setup" ? "Open my library" : "Save changes"}
        </button>
      </div>

      <div style={{ flex: "999 1 520px", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="caps">Preview</div>
        <h2 className="display" style={{ fontSize: 40, margin: 0 }}>{libraryName.trim() || "Your library"}</h2>
        <div style={{ fontFamily: "var(--display)", fontSize: 24, color: "var(--olive-deep)" }}>{shelves.books.trim() || "Books"}</div>
        <ShelfRow wood={wood} minHeight={270}>
          {SAMPLE.map(([t, a], i) => {
            const c = spineColorFor(i, colors);
            return (
              <Spine key={t} title={t} author={a} bg={c.bg} fg={c.fg} font={SPINE_FONTS[i % SPINE_FONTS.length]}
                height={210 + ((i * 37) % 50)} width={34 + ((i * 13) % 16)} kind={i % 3 === 0 ? "classic" : "modern"} lean={i === 6 ? -4 : 0} />
            );
          })}
        </ShelfRow>
      </div>
    </form>
  );
}
