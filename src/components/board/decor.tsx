// Scrapbook decorations: bulldog clips, paperclips, washi tape, star pins, and card faces.
import type { CSSProperties } from "react";

export const DECOR_COLORS = ["#c2185b", "#e53935", "#fb8c00", "#F4D35E", "#8ac926", "#2bb3a3", "#1f78c1", "#7b4bb7", "#5A3A22", "#3F4A2A", "#9aa1a8", "#1c1a12"];
export const NOTE_COLORS = ["#F4D35E", "#b5bd7a", "#f7c6d9", "#9ec5e8", "#c9a77c", "#FBF6EC", "#e9d4f0", "#ffd6a5"];

function shade(hex: string, amt: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function BulldogClip({ variant, color, id }: { variant: "polka" | "enamel" | "chrome" | "stripe"; color: string; id: string }) {
  const pid = `p-${id}`;
  const body =
    variant === "chrome" ? `url(#${pid}-ch)` : variant === "polka" ? `url(#${pid})` : variant === "stripe" ? `url(#${pid}-st)` : color;
  return (
    <svg viewBox="0 0 84 96" width="100%" height="100%" aria-hidden="true" style={{ overflow: "visible" }}>
      <defs>
        <pattern id={pid} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill={color} />
          <circle cx="5" cy="5" r="2.2" fill={shade(color, 110)} />
        </pattern>
        <pattern id={`${pid}-st`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill={color} />
          <rect width="5" height="10" fill={shade(color, 90)} />
        </pattern>
        <linearGradient id={`${pid}-ch`} x1="0" x2="1">
          <stop offset="0" stopColor="#8d949c" /><stop offset=".35" stopColor="#f4f6f8" /><stop offset=".6" stopColor="#b9c0c7" /><stop offset="1" stopColor="#6d747c" />
        </linearGradient>
      </defs>
      <circle cx="42" cy="16" r="12" fill="none" stroke={variant === "chrome" ? "#9aa1a8" : shade(color, -30)} strokeWidth="6" />
      <path d="M14 34 Q42 22 70 34 L78 90 Q42 96 6 90 Z" fill={body} stroke={variant === "chrome" ? "#5f666d" : "none"} />
      <path d="M14 34 Q42 22 70 34 L72 46 Q42 36 12 46 Z" fill={variant === "chrome" ? "#6d747c" : shade(color, -60)} opacity=".55" />
      <path d="M18 38 Q30 33 40 34" stroke="#fff" strokeWidth="2" opacity=".55" fill="none" />
    </svg>
  );
}

export function PaperClip({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 34 96" width="100%" height="100%" aria-hidden="true">
      <path d="M10 88 V18 a7 7 0 0 1 14 0 V76 a4.5 4.5 0 0 1 -9 0 V24" fill="none" stroke={color} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M10 88 V18 a7 7 0 0 1 14 0" fill="none" stroke="#fff" strokeWidth="1" opacity=".45" strokeLinecap="round" />
    </svg>
  );
}

export function StarPin({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <path d="M12 1.5 l3 6.8 7.4.6 -5.6 4.9 1.8 7.2 -6.6-4 -6.6 4 1.8-7.2 -5.6-4.9 7.4-.6z" fill={color} stroke={shade(color, -70)} strokeWidth=".8" />
      <path d="M12 4 l1.6 3.8" stroke="#fff" strokeWidth="1" opacity=".8" />
    </svg>
  );
}

export type TapePattern = "gingham" | "hearts" | "floral" | "stripes" | "stars" | "solid";
export const TAPE_PATTERNS: TapePattern[] = ["gingham", "hearts", "floral", "stripes", "stars", "solid"];

export function tapeStyle(pattern: TapePattern, color: string): CSSProperties {
  const light = shade(color, 120);
  switch (pattern) {
    case "gingham":
      return { backgroundColor: "#fff", backgroundImage: `linear-gradient(90deg, ${color}8c 50%, transparent 50%), linear-gradient(${color}8c 50%, transparent 50%)`, backgroundSize: "12px 12px" };
    case "hearts":
      return { backgroundColor: light, backgroundImage: `radial-gradient(circle at 25% 50%, ${color} 0 4px, transparent 4.5px), radial-gradient(circle at 75% 50%, ${shade(color, 60)} 0 3px, transparent 3.5px)`, backgroundSize: "20px 100%" };
    case "floral":
      return { backgroundColor: light, backgroundImage: `radial-gradient(circle, #ffb703 0 3px, ${color} 3.5px 5px, transparent 5.5px), radial-gradient(circle, #8ac926 0 2px, transparent 2.5px)`, backgroundSize: "22px 100%, 11px 50%", backgroundPosition: "0 0, 5px 7px" };
    case "stripes":
      return { backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 7px, #EFE6D3 7px 14px, ${shade(color, -50)} 14px 21px)` };
    case "stars":
      return { backgroundColor: color, backgroundImage: "radial-gradient(circle, #fff7c2 0 2px, transparent 2.5px)", backgroundSize: "14px 14px" };
    default:
      return { backgroundColor: color };
  }
}

export type CardFace = "lined" | "scallop" | "kraft" | "plain" | "grid";
export function cardStyle(face: CardFace, color: string): CSSProperties {
  switch (face) {
    case "lined":
      return {
        backgroundColor: color || "#FBF6EC",
        backgroundImage: "linear-gradient(90deg,transparent 40px,#d88b8b 40px 41.5px,transparent 41.5px),repeating-linear-gradient(180deg,transparent 0 31px,#a9c0d6 31px 32px)",
        backgroundPosition: "0 6px", padding: "34px 18px 14px 52px",
      };
    case "scallop":
      return { backgroundColor: color || "#FFF9EE", border: "3px solid #c62828", borderRadius: 22, boxShadow: "0 10px 22px rgba(60,40,20,.22), inset 0 0 0 6px #FFF9EE, inset 0 0 0 7px rgba(198,40,40,.35)", padding: "30px 22px 20px" };
    case "kraft":
      return { backgroundColor: color || "#c9a77c", backgroundImage: "radial-gradient(rgba(90,58,34,.18) 1px, transparent 1.4px)", backgroundSize: "5px 5px", padding: "28px 22px 18px" };
    case "grid":
      return { backgroundColor: color || "#FBF6EC", backgroundImage: "linear-gradient(rgba(31,78,140,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(31,78,140,.15) 1px, transparent 1px)", backgroundSize: "18px 18px", padding: "28px 20px 16px" };
    default:
      return { backgroundColor: color || "#FBF7EE", border: "1px solid rgba(90,58,34,.3)", padding: "26px 20px 16px" };
  }
}
