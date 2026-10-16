import Link from "next/link";
import { THEMES } from "@/lib/style";

export default function ThemeChips({ current, basePath }: { current: string; basePath: string }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
      {THEMES.map((t) => {
        const on = t.slug === current;
        return (
          <Link
            key={t.slug}
            href={`${basePath}?theme=${t.slug}`}
            aria-current={on ? "true" : undefined}
            style={{
              fontSize: 16, padding: "8px 16px", borderRadius: 999, minHeight: 40, display: "inline-flex", alignItems: "center",
              border: `1px solid ${on ? "var(--olive)" : "var(--olive-soft)"}`, textDecoration: "none",
              background: on ? "var(--olive)" : "rgba(251,247,238,.82)", color: on ? "#F3EBDD" : "var(--olive)",
            }}
          >
            {t.name}
          </Link>
        );
      })}
    </div>
  );
}
