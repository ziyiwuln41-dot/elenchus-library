import type { ReactNode } from "react";
import { WOODS, type WoodKey } from "@/lib/style";

export default function ShelfRow({ wood, children, minHeight = 300 }: { wood: WoodKey; children: ReactNode; minHeight?: number }) {
  const w = WOODS[wood] ?? WOODS.walnut;
  return (
    <div>
      <div style={{ border: `10px solid ${w.frame}`, borderBottom: "none", borderRadius: "4px 4px 0 0", overflowX: "auto" }}>
        <div
          style={{
            background: w.back,
            boxShadow: "inset 0 18px 30px rgba(0,0,0,.45), inset 0 -6px 12px rgba(0,0,0,.35)",
            display: "flex", alignItems: "flex-end", gap: 3, padding: "34px 20px 0", minHeight,
          }}
        >
          {children}
        </div>
      </div>
      <div style={{ height: 26, background: w.plank, boxShadow: "0 10px 18px rgba(0,0,0,.4)", borderTop: `2px solid ${w.lip}` }} />
    </div>
  );
}
