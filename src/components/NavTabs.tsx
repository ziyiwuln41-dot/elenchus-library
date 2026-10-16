"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Shelf" },
  { href: "/scrapbooks", label: "Scrapbook" },
  { href: "/questions", label: "Past Year Questions" },
];

export default function NavTabs() {
  const path = usePathname();
  return (
    <nav aria-label="Sections" style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
      {TABS.map((t) => {
        const on = t.href === "/" ? path === "/" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            style={{
              fontFamily: "var(--display)", fontSize: 22, fontWeight: 700, textDecoration: "none",
              color: on ? "#2b1a0c" : "var(--olive)", padding: "12px 4px",
              borderBottom: `3px solid ${on ? "var(--umber)" : "transparent"}`,
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
