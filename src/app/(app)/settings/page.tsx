import LibraryForm from "@/components/LibraryForm";
import InvitePanel from "@/components/InvitePanel";
import { requireProfile } from "@/lib/profile";

export default async function SettingsPage() {
  const { supabase, profile } = await requireProfile();
  let invites: string[] = [];
  if (profile.is_admin) {
    const { data } = await supabase.from("invites").select("email").order("created_at");
    invites = (data ?? []).map((r) => r.email as string);
  }
  return (
    <div>
      <h1 className="display" style={{ fontSize: 48, margin: "0 0 24px" }}>Settings</h1>
      <LibraryForm profile={profile} mode="settings" />
      {profile.is_admin && <InvitePanel initial={invites} />}
    </div>
  );
}
