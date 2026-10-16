// Shared look-and-feel data: palettes, shelf woods, spine fonts, GP themes.

export type PaletteKey = "klimt" | "olive-umber" | "ink-rose" | "sea-glass" | "custom";
export type WoodKey = "oak" | "walnut" | "ebony" | "cream";

export type SpineColor = { bg: string; fg: string };

export const PALETTES: Record<Exclude<PaletteKey, "custom">, { name: string; colors: SpineColor[] }> = {
  klimt: {
    name: "Klimt Gold",
    colors: [
      { bg: "#C4932F", fg: "#2A1E10" }, { bg: "#2E3820", fg: "#E9C877" }, { bg: "#6B2A2A", fg: "#F0E2C4" },
      { bg: "#E8D3A0", fg: "#3A2A18" }, { bg: "#1F1C14", fg: "#D9B86A" }, { bg: "#8A6A2E", fg: "#F7EBD3" },
      { bg: "#4F6D4F", fg: "#F3EBDD" }, { bg: "#B5612F", fg: "#F7EBD3" }, { bg: "#3B2E4A", fg: "#E9C877" },
      { bg: "#D9C9A3", fg: "#5A2A1A" }, { bg: "#5A3A22", fg: "#EAD7B0" }, { bg: "#9C7A2E", fg: "#1F1C14" },
    ],
  },
  "olive-umber": {
    name: "Olive & Umber",
    colors: [
      { bg: "#6B2A2A", fg: "#F0E2C4" }, { bg: "#D9C9A3", fg: "#3A2A18" }, { bg: "#3F5A35", fg: "#F0E6CC" },
      { bg: "#C4932F", fg: "#2A1E10" }, { bg: "#2D3A52", fg: "#E9D9B4" }, { bg: "#E6DCC6", fg: "#6B2A2A" },
      { bg: "#5A3A22", fg: "#EAD7B0" }, { bg: "#8A9A6B", fg: "#1F2616" }, { bg: "#4E2F45", fg: "#E9C877" },
      { bg: "#B5612F", fg: "#F7EBD3" }, { bg: "#2B2B28", fg: "#D9B86A" }, { bg: "#4F6D6F", fg: "#F3EBDD" },
    ],
  },
  "ink-rose": {
    name: "Ink & Rose",
    colors: [
      { bg: "#1E2A44", fg: "#F2D7D9" }, { bg: "#C98A93", fg: "#2A1418" }, { bg: "#5B2A3C", fg: "#F3E3E5" },
      { bg: "#EED9D6", fg: "#3A1E28" }, { bg: "#2B2B30", fg: "#E8B7BE" }, { bg: "#8E4A5A", fg: "#FBEFF0" },
      { bg: "#3F4F6B", fg: "#F2E6E8" }, { bg: "#D8B4A0", fg: "#2A1E28" }, { bg: "#6E2F3F", fg: "#F2D7D9" },
      { bg: "#A7B3C9", fg: "#1E2A44" }, { bg: "#432634", fg: "#EAC8CE" }, { bg: "#F4E8E4", fg: "#8E4A5A" },
    ],
  },
  "sea-glass": {
    name: "Sea Glass",
    colors: [
      { bg: "#2F5D62", fg: "#EAF2EE" }, { bg: "#A7C4BC", fg: "#1E3436" }, { bg: "#1D3557", fg: "#E3EEF0" },
      { bg: "#E6E1D3", fg: "#2F5D62" }, { bg: "#5E8B7E", fg: "#F4F1E8" }, { bg: "#C9B79C", fg: "#203A3D" },
      { bg: "#3A6EA5", fg: "#F4F1E8" }, { bg: "#DDEBE6", fg: "#1D3557" }, { bg: "#284B4F", fg: "#C9E4DA" },
      { bg: "#8FB3C0", fg: "#14262B" }, { bg: "#6D8A96", fg: "#F4F1E8" }, { bg: "#B8A07E", fg: "#14262B" },
    ],
  },
};

export const WOODS: Record<WoodKey, { name: string; frame: string; back: string; plank: string; lip: string }> = {
  oak: {
    name: "Oak",
    frame: "#9A6B3B",
    back: "linear-gradient(180deg,#5c3d20 0%,#452d16 100%)",
    plank: "repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 3px,rgba(0,0,0,.05) 3px 9px,rgba(255,255,255,.03) 9px 17px),linear-gradient(180deg,#c99a63 0%,#a5733f 45%,#7d5328 100%)",
    lip: "#d7ab78",
  },
  walnut: {
    name: "Walnut",
    frame: "#6e4524",
    back: "linear-gradient(180deg,#3b2414 0%,#2a190d 100%)",
    plank: "repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 3px,rgba(0,0,0,.05) 3px 9px,rgba(255,255,255,.03) 9px 17px),linear-gradient(180deg,#a2713f 0%,#7c5129 45%,#58371a 100%)",
    lip: "#b98a55",
  },
  ebony: {
    name: "Ebony",
    frame: "#2a211c",
    back: "linear-gradient(180deg,#1a1512 0%,#0f0c0a 100%)",
    plank: "repeating-linear-gradient(90deg,rgba(255,255,255,.03) 0 2px,rgba(0,0,0,.08) 2px 7px),linear-gradient(180deg,#4a3b31 0%,#2f251f 45%,#1c1612 100%)",
    lip: "#5c4a3d",
  },
  cream: {
    name: "Painted cream",
    frame: "#e4dac4",
    back: "linear-gradient(180deg,#d9cfb8 0%,#cbc0a6 100%)",
    plank: "linear-gradient(180deg,#f3ecdc 0%,#e2d8c2 50%,#cdc2a8 100%)",
    lip: "#fbf7ee",
  },
};

export const SPINE_FONTS = [
  "'Playfair Display', serif",
  "'Libre Baskerville', serif",
  "'Oswald', sans-serif",
  "'Bebas Neue', sans-serif",
  "'Abril Fatface', serif",
  "'Cinzel', serif",
  "'Josefin Sans', sans-serif",
  "'DM Serif Display', serif",
  "'EB Garamond', serif",
];

export const THEMES = [
  { slug: "science-technology", name: "Science & Technology" },
  { slug: "media-information", name: "Media & Information" },
  { slug: "politics-governance", name: "Politics & Governance" },
  { slug: "international-relations", name: "International Relations" },
  { slug: "society-culture", name: "Society & Culture" },
  { slug: "economics-work", name: "Economics & Work" },
  { slug: "environment", name: "Environment" },
  { slug: "education", name: "Education" },
  { slug: "arts-culture-language", name: "Arts, Culture & Language" },
  { slug: "health-ethics", name: "Health & Ethics" },
  { slug: "sport-leisure", name: "Sport & Leisure" },
  { slug: "singapore", name: "Singapore" },
];

// Readable text colour for a custom spine colour.
export function textOn(hex: string): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#2A1E10" : "#F3EBDD";
}

export function paletteColors(key: string, custom?: string[] | null): SpineColor[] {
  if (key === "custom" && custom && custom.length) return custom.map((bg) => ({ bg, fg: textOn(bg) }));
  return (PALETTES as Record<string, { colors: SpineColor[] }>)[key]?.colors ?? PALETTES.klimt.colors;
}

// Spread colours so neighbours never match: step through the palette by a stride coprime to its length.
export function spineColorFor(index: number, colors: SpineColor[]): SpineColor {
  const n = colors.length;
  const stride = n % 5 === 0 ? 7 : 5;
  return colors[(index * stride) % n];
}
