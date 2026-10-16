import LibraryForm from "@/components/LibraryForm";
import { requireProfile } from "@/lib/profile";

export default async function SetupPage() {
  const { profile } = await requireProfile({ allowUnonboarded: true });
  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: "48px 16px 80px" }}>
      <div className="caps">Welcome</div>
      <h1 className="display" style={{ fontSize: 56, margin: "6px 0 8px", lineHeight: 1 }}>Set up your library</h1>
      <p style={{ margin: "0 0 32px", maxWidth: 620 }}>Name it, choose the wood and the colours your books take on. You can change all of this later in Settings.</p>
      <LibraryForm profile={profile} mode="setup" />
    </main>
  );
}
