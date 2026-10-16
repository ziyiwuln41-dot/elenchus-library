export type ItemKind = "card" | "sticky" | "clip" | "paperclip" | "tape" | "pin" | "heading";

export type BoardItem = {
  id: string;
  page_id: string;
  kind: ItemKind;
  x: number;
  y: number;
  w: number | null;
  h: number | null;
  rotation: number;
  z: number;
  color: string | null;
  style: { face?: string; variant?: string; pattern?: string };
  text: string | null;
  link_source_id: string | null;
  updated_at?: string;
  updated_by?: string | null;
};

export type PageInfo = { id: string; scrapbook_id: string; title: string | null; position: number; width: number; height: number };
export type SourceRef = { id: string; title: string; theme: string; author: string | null };

export const DEFAULTS: Record<ItemKind, { w: number; h: number; color: string; style: BoardItem["style"]; text?: string }> = {
  card: { w: 340, h: 240, color: "#FBF6EC", style: { face: "lined" }, text: "" },
  sticky: { w: 260, h: 240, color: "#F4D35E", style: {}, text: "" },
  clip: { w: 84, h: 96, color: "#c2185b", style: { variant: "polka" } },
  paperclip: { w: 34, h: 96, color: "#e53935", style: {} },
  tape: { w: 150, h: 30, color: "#1f78c1", style: { pattern: "gingham" } },
  pin: { w: 40, h: 40, color: "#E9C877", style: {} },
  heading: { w: 640, h: 90, color: "#2E3820", style: {}, text: "" },
};

export const MIN: Record<ItemKind, { w: number; h: number }> = {
  card: { w: 160, h: 110 }, sticky: { w: 140, h: 120 }, clip: { w: 40, h: 46 }, paperclip: { w: 18, h: 50 },
  tape: { w: 50, h: 16 }, pin: { w: 20, h: 20 }, heading: { w: 200, h: 50 },
};
