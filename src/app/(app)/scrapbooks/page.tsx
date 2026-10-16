import Link from "next/link";
import ThemeChips from "@/components/ThemeChips";
import NewScrapbook from "@/components/board/NewScrapbook";
import { requireProfile } from "@/lib/profile";
import { THEMES } from "@/lib/style";

const COVERS = ["#3F4A2A", "#5A3A22", "#6B2A2A", "#2D3A52", "#4F6D4F", "#8A6A2E", "#3B2E4A", "#B5612F"];

export default async function ScrapbooksPage({ searchParams }: PageProps<"/scrapbooks">) {
  const { supabase, profile } = await requireProfile();
  const sp = await searchParams;
  const theme = THEMES.find((t) => t.slug === sp.theme)?.slug ?? THEMES[0].slug;

  const { data } = await supabase
    .from("scrapbooks")
    .select("id, title, owner, theme, created_at, scrapbook_pages(count)")
    .eq("theme", theme)
    .order("created_at", { ascending: false });
  const books = (data ?? []) as { id: string; title: string; owner: string; created_at: string; scrapbook_pages: { count: number }[] }[];

  return (
    <div>
      <ThemeChips current={theme} basePath="/scrapbooks" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 28 }}>
        <NewScrapbook theme={theme} />
        {books.map((b, i) => {
          const shared = b.owner !== profile.id;
          return (
            <Link
              key={b.id}
              href={`/scrapbooks/${b.id}`}
              style={{
                position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 280, padding: "28px 22px 22px 34px",
                textDecoration: "none", color: "#F3EBDD", background: COVERS[i % COVERS.length], borderRadius: "4px 10px 10px 4px",
                boxShadow: "inset 10px 0 0 rgba(0,0,0,.25), inset 12px 0 0 rgba(255,255,255,.08), 0 14px 24px rgba(40,25,10,.3)",
              }}
            >
              <span aria-hidden="true" style={{ position: "absolute", right: -10, top: 30, width: 34, height: 14, background: "repeating-linear-gradient(90deg,#E9C877 0 6px,#c99a3a 6px 12px)", transform: "rotate(8deg)" }} />
              <div>
                <div style={{ fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".25em", opacity: 0.8 }}>{shared ? "SHARED WITH YOU" : "SCRAPBOOK"}</div>
                <div style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 700, lineHeight: 1.1, marginTop: 10 }}>{b.title}</div>
              </div>
              <div style={{ fontSize: 14, opacity: 0.85 }}>
                {b.scrapbook_pages?.[0]?.count ?? 0} {(b.scrapbook_pages?.[0]?.count ?? 0) === 1 ? "page" : "pages"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
