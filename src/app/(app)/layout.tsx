import Link from "next/link";
import NavTabs from "@/components/NavTabs";
import { requireProfile } from "@/lib/profile";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const { profile } = await requireProfile();
  const name = profile.library_name?.trim() || "The Elenchus Library";
  const [first, ...rest] = name.split(" ");
  const last = rest.pop();

  return (
    <div>
      <header style={{ padding: "40px clamp(16px, 4vw, 56px) 22px", borderBottom: "6px double var(--umber)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="caps">General Paper · {profile.display_name ? `${profile.display_name}'s library` : "A private library"}</div>
          <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 0.95, margin: "8px 0 0" }}>
            {last ? <>{[first, ...rest].join(" ")} <em style={{ fontWeight: 500, color: "var(--umber)" }}>{last}</em></> : first}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link className="btn btn-ghost" href="/settings" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", background: "rgba(251,247,238,.75)" }}>Settings</Link>
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost" style={{ background: "rgba(251,247,238,.75)" }}>Sign out</button>
          </form>
        </div>
      </header>
      <div style={{ padding: "0 clamp(16px, 4vw, 56px)", borderBottom: "1px solid rgba(90,58,34,.3)", background: "rgba(236,226,203,.55)" }}>
        <NavTabs />
      </div>
      <main style={{ padding: "28px clamp(16px, 4vw, 56px) 80px" }}>{children}</main>
    </div>
  );
}
