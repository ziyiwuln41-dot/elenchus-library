import ThemeChips from "@/components/ThemeChips";
import ShelfRow from "@/components/ShelfRow";
import { requireProfile, shelfName } from "@/lib/profile";
import { THEMES } from "@/lib/style";

export default async function ShelfPage({ searchParams }: PageProps<"/">) {
  const { profile } = await requireProfile();
  const sp = await searchParams;
  const theme = THEMES.find((t) => t.slug === sp.theme)?.slug ?? THEMES[0].slug;

  return (
    <div>
      <ThemeChips current={theme} basePath="/" />
      <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
        {(["books", "current", "research"] as const).map((k) => (
          <section key={k}>
            <h2 className="display" style={{ fontSize: 32, margin: "0 0 10px" }}>{shelfName(profile, k)}</h2>
            <ShelfRow wood={profile.wood}>
              <div style={{ alignSelf: "center", color: "rgba(233,200,119,.85)", fontStyle: "italic", paddingBottom: 30 }}>
                Your sources arrive here in the next build phase.
              </div>
            </ShelfRow>
          </section>
        ))}
      </div>
    </div>
  );
}
