import ThemeChips from "@/components/ThemeChips";
import ShelfView from "@/components/shelf/ShelfView";
import { requireProfile, shelfName } from "@/lib/profile";
import { THEMES, paletteColors } from "@/lib/style";
import type { AnalysisLine, Excerpt, Source } from "@/lib/sources";

export default async function ShelfPage({ searchParams }: PageProps<"/">) {
  const { supabase, profile } = await requireProfile();
  const sp = await searchParams;
  const theme = THEMES.find((t) => t.slug === sp.theme)?.slug ?? THEMES[0].slug;

  // First visit: copy the shared starter books and papers onto this person's own shelves.
  if (!profile.starter_seeded) await supabase.rpc("seed_my_shelf");

  const { data: srcData } = await supabase
    .from("sources").select("*").eq("owner", profile.id).eq("theme", theme)
    .order("sort").order("created_at");
  const sources = (srcData ?? []) as Source[];
  const ids = sources.map((s) => s.id);

  let excerpts: Excerpt[] = [];
  let lines: AnalysisLine[] = [];
  if (ids.length) {
    const { data: ex } = await supabase.from("excerpts").select("*").in("source_id", ids).order("created_at");
    excerpts = (ex ?? []) as Excerpt[];
    const exIds = excerpts.map((e) => e.id);
    if (exIds.length) {
      const { data: ln } = await supabase.from("analysis_lines").select("*").in("excerpt_id", exIds).order("created_at");
      lines = (ln ?? []) as AnalysisLine[];
    }
  }

  return (
    <div>
      <ThemeChips current={theme} basePath="/" />
      <ShelfView
        theme={theme}
        sources={sources}
        excerpts={excerpts}
        lines={lines}
        wood={profile.wood}
        colors={paletteColors(profile.palette, profile.palette_custom)}
        initialPicked={typeof sp.open === "string" ? sp.open : null}
        shelfNames={{ books: shelfName(profile, "books"), current: shelfName(profile, "current"), research: shelfName(profile, "research") }}
      />
    </div>
  );
}
