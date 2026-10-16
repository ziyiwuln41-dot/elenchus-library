"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BulldogClip, PaperClip, StarPin, tapeStyle, cardStyle, DECOR_COLORS, NOTE_COLORS, TAPE_PATTERNS, type CardFace, type TapePattern } from "./decor";
import { DEFAULTS, MIN, type BoardItem, type ItemKind, type PageInfo, type SourceRef } from "./types";

type Drag =
  | { mode: "move"; id: string; dx: number; dy: number }
  | { mode: "rotate"; id: string; cx: number; cy: number }
  | { mode: "resize"; id: string; sx: number; sy: number; sw: number; sh: number };

const FACES: CardFace[] = ["lined", "scallop", "kraft", "grid", "plain"];
const CLIPS = ["polka", "enamel", "chrome", "stripe"] as const;
const TEXT_KINDS: ItemKind[] = ["card", "sticky", "heading"];

export default function Board({
  page, initialItems, sources, canEdit, userId, userName,
}: {
  page: PageInfo; initialItems: BoardItem[]; sources: SourceRef[]; canEdit: boolean; userId: string; userName: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<BoardItem[]>(initialItems);
  const [size, setSize] = useState({ w: page.width, h: page.height });
  const [sel, setSel] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.75);
  const [linking, setLinking] = useState(false);
  const [filter, setFilter] = useState("");
  const drag = useRef<Drag | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const draggingId = useRef<string | null>(null);
  const chan = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSend = useRef<Record<string, number>>({});
  const [peers, setPeers] = useState<Record<string, { name: string; color: string }>>({});
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number; t: number }>>({});
  const [locks, setLocks] = useState<Record<string, { uid: string; name: string }>>({});
  const myColor = colorFor(userId);

  // Send a realtime message, at most once per `gap` ms for each kind of message.
  const send = useCallback((event: string, payload: Record<string, unknown>, gap = 40, key = event) => {
    const now = Date.now();
    if (gap && now - (lastSend.current[key] ?? 0) < gap) return;
    lastSend.current[key] = now;
    chan.current?.send({ type: "broadcast", event, payload: { ...payload, uid: userId } });
  }, [userId]);

  const selected = items.find((i) => i.id === sel) ?? null;
  const patch = useCallback((id: string, p: Partial<BoardItem>) => setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...p } : i))), []);

  const save = useCallback(
    async (id: string, p: Partial<BoardItem>) => {
      await supabase.from("board_items").update({ ...p, updated_at: new Date().toISOString(), updated_by: userId }).eq("id", id);
    },
    [supabase, userId],
  );
  const saveSoon = useCallback(
    (id: string, p: Partial<BoardItem>) => {
      clearTimeout(timers.current[id]);
      timers.current[id] = setTimeout(() => save(id, p), 500);
    },
    [save],
  );

  // Live collaboration: database changes, plus presence, cursors, live drags, live typing and note locks.
  useEffect(() => {
    const ch = supabase.channel(`board-${page.id}`, { config: { presence: { key: userId }, broadcast: { self: false } } });
    chan.current = ch;
    ch.on("postgres_changes", { event: "*", schema: "public", table: "board_items", filter: `page_id=eq.${page.id}` }, (msg) => {
      if (msg.eventType === "DELETE") {
        const old = msg.old as { id: string };
        setItems((arr) => arr.filter((i) => i.id !== old.id));
        return;
      }
      const row = msg.new as BoardItem;
      if (row.updated_by === userId) return;
      if (draggingId.current === row.id) return;
      setItems((arr) => (arr.some((i) => i.id === row.id) ? arr.map((i) => (i.id === row.id ? { ...row } : i)) : [...arr, row]));
    })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "scrapbook_pages", filter: `id=eq.${page.id}` }, (msg) => {
        const p = msg.new as PageInfo;
        setSize({ w: p.width, h: p.height });
      })
      .on("broadcast", { event: "cursor" }, ({ payload }) => {
        setCursors((c) => ({ ...c, [payload.uid]: { x: payload.x, y: payload.y, t: Date.now() } }));
      })
      .on("broadcast", { event: "move" }, ({ payload }) => {
        if (draggingId.current === payload.id) return;
        setItems((arr) => arr.map((i) => (i.id === payload.id ? { ...i, x: payload.x, y: payload.y, w: payload.w, h: payload.h, rotation: payload.rotation } : i)));
      })
      .on("broadcast", { event: "text" }, ({ payload }) => {
        setItems((arr) => arr.map((i) => (i.id === payload.id ? { ...i, text: payload.text } : i)));
      })
      .on("broadcast", { event: "lock" }, ({ payload }) => {
        setLocks((l) => {
          const n = { ...l };
          if (payload.on) n[payload.id] = { uid: payload.uid, name: payload.name };
          else if (n[payload.id]?.uid === payload.uid) delete n[payload.id];
          return n;
        });
      })
      .on("presence", { event: "sync" }, () => {
        const state = ch.presenceState<{ name: string; color: string }>();
        const next: Record<string, { name: string; color: string }> = {};
        for (const [k, v] of Object.entries(state)) if (k !== userId && v[0]) next[k] = { name: v[0].name, color: v[0].color };
        setPeers(next);
        // Drop cursors and locks of anyone who left.
        setCursors((c) => Object.fromEntries(Object.entries(c).filter(([k]) => next[k])));
        setLocks((l) => Object.fromEntries(Object.entries(l).filter(([, v]) => next[v.uid])));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") ch.track({ name: userName, color: colorFor(userId) });
      });
    return () => { chan.current = null; supabase.removeChannel(ch); };
  }, [supabase, page.id, userId, userName]);

  function toBoard(e: { clientX: number; clientY: number }) {
    const el = scroller.current!.querySelector("[data-board]") as HTMLElement;
    const r = el.getBoundingClientRect();
    return { x: (e.clientX - r.left) / zoom, y: (e.clientY - r.top) / zoom };
  }

  function startMove(e: React.PointerEvent, it: BoardItem) {
    if (!canEdit) return;
    e.stopPropagation();
    setSel(it.id);
    const p = toBoard(e);
    drag.current = { mode: "move", id: it.id, dx: p.x - it.x, dy: p.y - it.y };
    draggingId.current = it.id;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function startRotate(e: React.PointerEvent, it: BoardItem) {
    e.stopPropagation();
    drag.current = { mode: "rotate", id: it.id, cx: it.x + (it.w ?? 0) / 2, cy: it.y + (it.h ?? 0) / 2 };
    draggingId.current = it.id;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function startResize(e: React.PointerEvent, it: BoardItem) {
    e.stopPropagation();
    const p = toBoard(e);
    drag.current = { mode: "resize", id: it.id, sx: p.x, sy: p.y, sw: it.w ?? 0, sh: it.h ?? 0 };
    draggingId.current = it.id;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onMove(e: React.PointerEvent) {
    if (Object.keys(peers).length) {
      const c = toBoard(e);
      send("cursor", { x: Math.round(c.x), y: Math.round(c.y) }, 60);
    }
    const d = drag.current;
    if (!d) return;
    const p = toBoard(e);
    const it = items.find((i) => i.id === d.id);
    if (!it) return;
    let next = { x: it.x, y: it.y, w: it.w, h: it.h, rotation: it.rotation };
    if (d.mode === "move") next = { ...next, x: Math.max(0, p.x - d.dx), y: Math.max(0, p.y - d.dy) };
    else if (d.mode === "rotate") next = { ...next, rotation: Math.round((Math.atan2(p.y - d.cy, p.x - d.cx) * 180) / Math.PI + 90) };
    else {
      const m = MIN[it.kind];
      next = { ...next, w: Math.max(m.w, d.sw + (p.x - d.sx)), h: Math.max(m.h, d.sh + (p.y - d.sy)) };
    }
    patch(d.id, next);
    send("move", { id: d.id, ...next });
  }
  async function onUp() {
    const d = drag.current;
    drag.current = null;
    draggingId.current = null;
    if (!d) return;
    const it = items.find((i) => i.id === d.id);
    if (!it) return;
    send("move", { id: it.id, x: it.x, y: it.y, w: it.w, h: it.h, rotation: it.rotation }, 0, `drop-${it.id}`);
    await save(it.id, { x: it.x, y: it.y, w: it.w, h: it.h, rotation: it.rotation });
    // Let the page grow when things reach its edge.
    const right = it.x + (it.w ?? 0), bottom = it.y + (it.h ?? 0);
    if (right > size.w - 200 || bottom > size.h - 200) {
      const next = { w: right > size.w - 200 ? size.w + 600 : size.w, h: bottom > size.h - 200 ? size.h + 600 : size.h };
      setSize(next);
      await supabase.from("scrapbook_pages").update({ width: next.w, height: next.h }).eq("id", page.id);
    }
  }

  async function add(kind: ItemKind, extra: Partial<BoardItem> = {}) {
    const d = DEFAULTS[kind];
    const sc = scroller.current!;
    const cx = (sc.scrollLeft + sc.clientWidth / 2) / zoom, cy = (sc.scrollTop + sc.clientHeight / 2) / zoom;
    const jitter = () => Math.round((Math.random() - 0.5) * 80);
    const item: BoardItem = {
      id: crypto.randomUUID(), page_id: page.id, kind,
      x: Math.max(0, Math.round(cx - d.w / 2 + jitter())), y: Math.max(0, Math.round(cy - d.h / 2 + jitter())),
      w: d.w, h: d.h, rotation: kind === "tape" ? -8 : Math.round((Math.random() - 0.5) * 6),
      z: Math.max(0, ...items.map((i) => i.z)) + 1, color: d.color, style: { ...d.style }, text: d.text ?? null, link_source_id: null,
      ...extra,
    };
    setItems((arr) => [...arr, item]);
    setSel(item.id);
    await supabase.from("board_items").insert({ ...item, updated_by: userId });
  }

  async function remove(id: string) {
    setItems((arr) => arr.filter((i) => i.id !== id));
    setSel(null);
    await supabase.from("board_items").delete().eq("id", id);
  }
  function update(id: string, p: Partial<BoardItem>) {
    patch(id, p);
    save(id, p);
  }
  function front(id: string) {
    const z = Math.max(0, ...items.map((i) => i.z)) + 1;
    update(id, { z });
  }

  useEffect(() => {
    function key(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (t.tagName === "TEXTAREA" || t.tagName === "INPUT") return;
      if ((e.key === "Delete" || e.key === "Backspace") && sel && canEdit) { e.preventDefault(); remove(sel); }
      if (e.key === "Escape") setSel(null);
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const sourceById = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);
  const shown = sources.filter((s) => !filter.trim() || s.title.toLowerCase().includes(filter.toLowerCase())).slice(0, 40);

  const trayBtn: React.CSSProperties = {
    minWidth: 48, minHeight: 48, borderRadius: 6, border: "1px solid rgba(90,58,34,.25)", background: "var(--paper-light)",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 6, flexDirection: "column", gap: 2, fontSize: 12,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {canEdit && (
        <div role="toolbar" aria-label="Tray" className="card" style={{ padding: "10px 12px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", position: "sticky", top: 8, zIndex: 20 }}>
          <span className="caps" style={{ marginRight: 4 }}>Tray</span>
          <button style={trayBtn} onClick={() => add("card", { style: { face: "lined" }, color: "#FBF6EC" })} title="Lined card"><span style={{ width: 30, height: 20, ...cardStyle("lined", "#FBF6EC"), padding: 0, backgroundSize: "auto, 100% 6px" }} />Card</button>
          <button style={trayBtn} onClick={() => add("card", { style: { face: "scallop" }, color: "#FFF9EE" })} title="Scalloped card"><span style={{ width: 30, height: 20, borderRadius: 6, border: "2px solid #c62828", background: "#FFF9EE" }} />Scallop</button>
          <button style={trayBtn} onClick={() => add("card", { style: { face: "kraft" }, color: "#c9a77c" })} title="Kraft card"><span style={{ width: 30, height: 20, background: "#c9a77c" }} />Kraft</button>
          <button style={trayBtn} onClick={() => add("sticky")} title="Sticky note"><span style={{ width: 22, height: 22, background: "#F4D35E", boxShadow: "0 2px 3px rgba(0,0,0,.2)" }} />Sticky</button>
          <button style={trayBtn} onClick={() => add("heading", { text: "" })} title="Heading"><span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18 }}>Aa</span>Title</button>
          <span style={{ width: 1, alignSelf: "stretch", background: "rgba(90,58,34,.2)" }} />
          <button style={trayBtn} onClick={() => add("clip", { style: { variant: "polka" }, color: "#c2185b" })} title="Bulldog clip"><span style={{ width: 22, height: 26 }}><BulldogClip variant="polka" color="#c2185b" id="t1" /></span>Clip</button>
          <button style={trayBtn} onClick={() => add("clip", { style: { variant: "chrome" }, color: "#9aa1a8" })} title="Chrome clip"><span style={{ width: 22, height: 26 }}><BulldogClip variant="chrome" color="#9aa1a8" id="t2" /></span>Chrome</button>
          <button style={trayBtn} onClick={() => add("paperclip", { color: DECOR_COLORS[Math.floor(Math.random() * 8)] })} title="Paperclip"><span style={{ width: 10, height: 26 }}><PaperClip color="#2bb3a3" /></span>Paperclip</button>
          <button style={trayBtn} onClick={() => add("tape", { style: { pattern: TAPE_PATTERNS[Math.floor(Math.random() * 5)] }, color: DECOR_COLORS[Math.floor(Math.random() * 8)] })} title="Washi tape"><span style={{ width: 34, height: 12, ...tapeStyle("hearts", "#e53935") }} />Tape</button>
          <button style={trayBtn} onClick={() => add("pin", { color: ["#E9C877", "#ff8fab", "#9ec5e8", "#c0c7cf"][Math.floor(Math.random() * 4)] })} title="Star pin"><span style={{ width: 20, height: 20 }}><StarPin color="#E9C877" /></span>Star</button>
          <span style={{ flex: 1 }} />
          <PresenceDots me={{ name: userName, color: myColor }} peers={peers} />
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            Zoom
            <select className="input" style={{ minHeight: 36, padding: "4px 8px" }} value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>
              <option value={0.5}>50%</option><option value={0.75}>75%</option><option value={1}>100%</option>
            </select>
          </label>
        </div>
      )}

      {!canEdit && (
        <div className="card" style={{ padding: "8px 12px", display: "flex", gap: 10, alignItems: "center" }}>
          <span>You can view this scrapbook. Changes appear as others make them.</span>
          <span style={{ flex: 1 }} />
          <PresenceDots me={{ name: userName, color: myColor }} peers={peers} />
        </div>
      )}

      {selected && canEdit && (
        <div className="card" role="group" aria-label="Selected item" style={{ padding: "8px 12px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", position: "sticky", top: 84, zIndex: 20 }}>
          <span className="caps">Selected</span>
          {(selected.kind === "card" ? FACES : []).map((f) => (
            <button key={f} onClick={() => update(selected.id, { style: { ...selected.style, face: f } })} aria-pressed={selected.style.face === f}
              style={{ ...trayBtn, minWidth: 40, minHeight: 36, fontSize: 12, borderColor: selected.style.face === f ? "var(--olive-deep)" : undefined }}>{f}</button>
          ))}
          {selected.kind === "clip" && CLIPS.map((v) => (
            <button key={v} onClick={() => update(selected.id, { style: { ...selected.style, variant: v } })} aria-pressed={selected.style.variant === v}
              style={{ ...trayBtn, minWidth: 40, minHeight: 36, fontSize: 12, borderColor: selected.style.variant === v ? "var(--olive-deep)" : undefined }}>{v}</button>
          ))}
          {selected.kind === "tape" && TAPE_PATTERNS.map((pt) => (
            <button key={pt} title={pt} aria-label={`${pt} tape`} onClick={() => update(selected.id, { style: { ...selected.style, pattern: pt } })}
              style={{ width: 40, height: 24, border: selected.style.pattern === pt ? "2px solid var(--olive-deep)" : "1px solid rgba(90,58,34,.3)", cursor: "pointer", ...tapeStyle(pt, selected.color ?? "#1f78c1") }} />
          ))}
          <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {(selected.kind === "sticky" || selected.kind === "card" ? NOTE_COLORS : DECOR_COLORS).map((c) => (
              <button key={c} aria-label={`Colour ${c}`} onClick={() => update(selected.id, { color: c })}
                style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: selected.color === c ? "2px solid #1c1a12" : "1px solid rgba(0,0,0,.2)", cursor: "pointer" }} />
            ))}
            <input type="color" aria-label="Any colour" value={selected.color ?? "#ffffff"} onChange={(e) => update(selected.id, { color: e.target.value })} style={{ width: 30, height: 28, border: "none", background: "none" }} />
          </span>
          <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 10px", fontSize: 14 }} onClick={() => update(selected.id, { rotation: selected.rotation - 5 })} aria-label="Rotate left">⟲</button>
          <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 10px", fontSize: 14 }} onClick={() => update(selected.id, { rotation: selected.rotation + 5 })} aria-label="Rotate right">⟳</button>
          <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 10px", fontSize: 14 }} onClick={() => front(selected.id)}>Bring to front</button>
          {TEXT_KINDS.includes(selected.kind) && (
            <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 10px", fontSize: 14 }} onClick={() => setLinking(true)}>
              {selected.link_source_id ? "Change linked source" : "Link a source"}
            </button>
          )}
          <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 10px", fontSize: 14, color: "#7a2a1c", borderColor: "#7a2a1c" }} onClick={() => remove(selected.id)}>Delete</button>
        </div>
      )}

      <div
        ref={scroller}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={() => { if (drag.current) onUp(); }}
        style={{ overflow: "auto", height: "72vh", border: "1px solid rgba(90,58,34,.3)", borderRadius: 6, background: "rgba(251,247,238,.35)" }}
      >
        <div style={{ width: size.w * zoom, height: size.h * zoom, position: "relative" }}>
          <div
            data-board
            onPointerDown={() => setSel(null)}
            style={{
              position: "absolute", left: 0, top: 0, width: size.w, height: size.h, transform: `scale(${zoom})`, transformOrigin: "0 0",
              backgroundColor: "#EFE6D3",
              backgroundImage: "linear-gradient(rgba(90,58,34,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(90,58,34,.07) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          >
            {[...items].sort((a, b) => a.z - b.z).map((it) => (
              <ItemView
                key={it.id}
                it={it}
                selected={sel === it.id}
                canEdit={canEdit}
                linked={it.link_source_id ? sourceById.get(it.link_source_id) ?? null : null}
                onDown={(e) => startMove(e, it)}
                onRotate={(e) => startRotate(e, it)}
                onResize={(e) => startResize(e, it)}
                onText={(text) => { patch(it.id, { text }); saveSoon(it.id, { text }); send("text", { id: it.id, text }, 0); }}
                onFocus={() => { setSel(it.id); send("lock", { id: it.id, on: true, name: userName }, 0); }}
                onBlur={() => send("lock", { id: it.id, on: false }, 0)}
                lockedBy={locks[it.id] && locks[it.id].uid !== userId ? locks[it.id].name : null}
              />
            ))}
            {Object.entries(cursors).map(([uid, c]) => peers[uid] && (
              <div key={uid} aria-hidden="true" style={{ position: "absolute", left: c.x, top: c.y, zIndex: 100000, pointerEvents: "none", transition: "left .08s linear, top .08s linear" }}>
                <svg width="22" height="22" viewBox="0 0 22 22"><path d="M2 2 L18 9 L10 11 L8 19 Z" fill={peers[uid].color} stroke="#fff" strokeWidth="1.5" /></svg>
                <span style={{ position: "absolute", left: 18, top: 16, background: peers[uid].color, color: "#fff", fontSize: 14, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{peers[uid].name}</span>
              </div>
            ))}
            {items.length === 0 && (
              <div style={{ position: "absolute", left: 80, top: 80, fontFamily: "var(--hand)", fontSize: 34, color: "rgba(90,58,34,.55)" }}>
                {canEdit ? "An empty page. Pick something from the tray above to begin." : "Nothing on this page yet."}
              </div>
            )}
          </div>
        </div>
      </div>

      {linking && selected && (
        <div role="dialog" aria-modal="true" aria-label="Link a source" style={{ position: "fixed", inset: 0, background: "rgba(40,28,14,.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ width: "min(560px, 100%)", maxHeight: "80vh", display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="tape" />
            <h2 className="display" style={{ fontSize: 28, margin: 0 }}>Link a source from your shelf</h2>
            <label htmlFor="lnk-f" className="sr-only">Filter</label>
            <input id="lnk-f" className="input" placeholder="Filter by title" value={filter} onChange={(e) => setFilter(e.target.value)} autoFocus />
            <ul style={{ listStyle: "none", margin: 0, padding: 0, overflowY: "auto", flex: 1 }}>
              {shown.map((s) => (
                <li key={s.id}>
                  <button onClick={() => { update(selected.id, { link_source_id: s.id }); setLinking(false); }}
                    style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "1px dashed rgba(90,58,34,.2)", padding: "8px 4px", cursor: "pointer", minHeight: 44 }}>
                    <strong>{s.title}</strong>{s.author ? ` — ${s.author}` : ""}
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              {selected.link_source_id && <button className="btn btn-ghost" onClick={() => { update(selected.id, { link_source_id: null }); setLinking(false); }}>Remove link</button>}
              <button className="btn btn-ghost" onClick={() => setLinking(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemView({
  it, selected, canEdit, linked, onDown, onRotate, onResize, onText, onFocus, onBlur, lockedBy,
}: {
  it: BoardItem; selected: boolean; canEdit: boolean; linked: SourceRef | null;
  onDown: (e: React.PointerEvent) => void; onRotate: (e: React.PointerEvent) => void; onResize: (e: React.PointerEvent) => void;
  onText: (t: string) => void; onFocus: () => void; onBlur: () => void; lockedBy: string | null;
}) {
  const base: React.CSSProperties = {
    position: "absolute", left: it.x, top: it.y, width: it.w ?? undefined, height: it.h ?? undefined,
    transform: `rotate(${it.rotation}deg)`, zIndex: it.z, boxSizing: "border-box",
    outline: selected ? "2px dashed rgba(63,74,42,.7)" : "none", outlineOffset: 6,
    cursor: canEdit ? "grab" : "default", touchAction: "none",
  };
  const isText = TEXT_KINDS.includes(it.kind);
  const textArea = (fontFamily: string, fontSize: number, color: string, style: React.CSSProperties = {}) => (
    <textarea
      aria-label="Note text"
      value={it.text ?? ""}
      readOnly={!canEdit || !!lockedBy}
      onChange={(e) => onText(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      onPointerDown={(e) => e.stopPropagation()}
      placeholder={canEdit ? "Write here…" : ""}
      style={{
        width: "100%", height: "100%", resize: "none", border: "none", background: "transparent", outline: "none",
        fontFamily, fontSize, lineHeight: "32px", color, cursor: "text", padding: 0, ...style,
      }}
    />
  );

  let body: React.ReactNode = null;
  if (it.kind === "card") {
    body = (
      <div style={{ width: "100%", height: "100%", boxShadow: "0 10px 20px rgba(60,40,20,.22)", display: "flex", flexDirection: "column", ...cardStyle((it.style.face as CardFace) ?? "lined", it.color ?? "") }}>
        {textArea("var(--hand)", 25, it.style.face === "kraft" ? "#2a190d" : "#24324a")}
      </div>
    );
  } else if (it.kind === "sticky") {
    body = (
      <div style={{ width: "100%", height: "100%", background: it.color ?? "#F4D35E", backgroundImage: "linear-gradient(180deg, rgba(0,0,0,.05), transparent 30%)", padding: "30px 20px 14px", boxShadow: "0 14px 18px -8px rgba(60,40,20,.35)", display: "flex" }}>
        {textArea("var(--hand)", 26, "#1d2414")}
      </div>
    );
  } else if (it.kind === "heading") {
    body = textArea("var(--display)", 52, it.color ?? "#2E3820", { fontWeight: 700, lineHeight: 1.1 });
  } else if (it.kind === "clip") {
    body = <BulldogClip variant={(it.style.variant as "polka") ?? "polka"} color={it.color ?? "#c2185b"} id={it.id.slice(0, 8)} />;
  } else if (it.kind === "paperclip") {
    body = <PaperClip color={it.color ?? "#e53935"} />;
  } else if (it.kind === "pin") {
    body = <StarPin color={it.color ?? "#E9C877"} />;
  } else if (it.kind === "tape") {
    body = <div style={{ width: "100%", height: "100%", opacity: 0.9, ...tapeStyle((it.style.pattern as TapePattern) ?? "gingham", it.color ?? "#1f78c1") }} />;
  }

  const handle: React.CSSProperties = { position: "absolute", width: 22, height: 22, borderRadius: "50%", background: "#3F4A2A", border: "2px solid #F3EBDD", zIndex: 2 };

  return (
    <div style={base} onPointerDown={onDown}>
      {isText && canEdit && (
        <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 24, cursor: "grab", zIndex: 1 }} />
      )}
      {body}
      {lockedBy && (
        <span style={{ position: "absolute", right: 8, top: -14, zIndex: 3, background: "#3F4A2A", color: "#F3EBDD", fontSize: 13, padding: "2px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
          {lockedBy} is typing…
        </span>
      )}
      {linked && (
        <Link
          href={`/?theme=${linked.theme}&open=${linked.id}`}
          onPointerDown={(e) => e.stopPropagation()}
          style={{ position: "absolute", left: 12, bottom: -16, zIndex: 3, display: "inline-flex", gap: 6, alignItems: "center", maxWidth: "90%", background: "#EFE6D3", border: "1px solid #6B7344", borderRadius: 999, padding: "4px 12px", fontSize: 14, color: "#3F4A2A", textDecoration: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
        >
          ↗ {linked.title}
        </Link>
      )}
      {selected && canEdit && (
        <>
          <span role="presentation" onPointerDown={onRotate} title="Rotate" style={{ ...handle, left: "50%", top: -40, marginLeft: -11, cursor: "grab" }} />
          <span role="presentation" onPointerDown={onResize} title="Resize" style={{ ...handle, right: -12, bottom: -12, borderRadius: 4, cursor: "nwse-resize" }} />
        </>
      )}
    </div>
  );
}

function colorFor(id: string) {
  const colors = ["#c2185b", "#1f78c1", "#2bb3a3", "#fb8c00", "#7b4bb7", "#3F5A35", "#B5612F", "#6B2A2A"];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
}

function PresenceDots({ me, peers }: { me: { name: string; color: string }; peers: Record<string, { name: string; color: string }> }) {
  const all = [me, ...Object.values(peers)];
  return (
    <span aria-label={`On this page: ${all.map((p) => p.name).join(", ")}`} style={{ display: "flex", alignItems: "center" }}>
      {all.map((p, i) => (
        <span key={i} title={i === 0 ? `${p.name} (you)` : p.name}
          style={{ width: 32, height: 32, borderRadius: "50%", background: p.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, border: "2px solid #FBF7EE", marginLeft: i ? -8 : 0 }}>
          {p.name.slice(0, 1).toUpperCase()}
        </span>
      ))}
    </span>
  );
}
