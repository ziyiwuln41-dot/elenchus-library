import { SPINE_FONTS, spineColorFor, type SpineColor } from "@/lib/style";
import type { SpineKind } from "@/components/Spine";

export type ShelfKey = "books" | "current" | "research";
export type SourceKind = "book" | "article" | "report" | "paper";

export type Source = {
  id: string;
  owner: string;
  theme: string;
  shelf: ShelfKey;
  kind: SourceKind;
  title: string;
  author: string | null;
  publication: string | null;
  year: string | null;
  url: string | null;
  doi: string | null;
  isbn: string | null;
  spine_color: string | null;
  spine_text_color: string | null;
  spine_font: string | null;
  sort: number;
  created_at: string;
};

export type Excerpt = { id: string; source_id: string; text: string; page: string | null; created_at: string };
export type AnalysisKind = "proves" | "limits" | "counter" | "answers" | "note";
export type AnalysisLine = { id: string; excerpt_id: string; kind: AnalysisKind; text: string; created_at: string };

export const ANALYSIS_KINDS: { key: AnalysisKind; label: string }[] = [
  { key: "proves", label: "What it proves" },
  { key: "limits", label: "Its limits" },
  { key: "counter", label: "Counter-reading" },
  { key: "answers", label: "Questions it answers" },
  { key: "note", label: "Note" },
];

export const KINDS_BY_SHELF: Record<ShelfKey, { key: SourceKind; label: string }[]> = {
  books: [{ key: "book", label: "Book" }],
  current: [{ key: "article", label: "Article" }, { key: "report", label: "Report" }],
  research: [{ key: "paper", label: "Research paper" }, { key: "report", label: "Report" }],
};

export function kindLabel(k: SourceKind) {
  return { book: "Book", article: "Current affairs", report: "Report", paper: "Research paper" }[k];
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Stable, varied look for a spine, derived from the source itself.
export function spineLook(src: Source, index: number, colors: SpineColor[]) {
  const h = hash(src.id);
  const auto = spineColorFor(index, colors);
  const bg = src.spine_color || auto.bg;
  const fg = src.spine_text_color || (src.spine_color ? autoText(src.spine_color) : auto.fg);
  let kind: SpineKind, width: number, height: number, font: string;
  if (src.shelf === "research") {
    kind = "journal"; width = 38 + (h % 5); height = 250 + (h % 3) * 4; font = "'Space Mono', monospace";
  } else if (src.kind === "article") {
    kind = "mag"; width = 20 + (h % 7); height = 220 + (h % 26); font = SPINE_FONTS[h % SPINE_FONTS.length];
  } else {
    kind = h % 3 === 0 ? "classic" : "modern";
    width = 32 + (h % 21); height = 218 + (h % 62); font = SPINE_FONTS[h % SPINE_FONTS.length];
  }
  if (src.spine_font) font = src.spine_font;
  const lean = h % 11 === 0 ? (h % 2 ? -4 : 4) : 0;
  return { bg, fg, kind, width, height, font, lean };
}

function autoText(hex: string) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? "#2A1E10" : "#F3EBDD";
}

export function citation(s: Source) {
  const parts = [s.author, s.year ? `(${s.year})` : null, s.title, s.publication].filter(Boolean);
  return parts.join(". ").replace(/\.\s*\(/, " (") + (s.doi ? `. https://doi.org/${s.doi}` : s.url ? `. ${s.url}` : "");
}
