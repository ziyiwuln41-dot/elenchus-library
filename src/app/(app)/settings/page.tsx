import LibraryForm from "@/components/LibraryForm";
import InvitePanel from "@/components/InvitePanel";
import { requireProfile } from "@/lib/profile";

export default async function SettingsPage() {
  const { profile } = await requireProfile();
  return (
    <div>
      <h1 className="display" style={{ fontSize: 48, margin: "0 0 24px" }}>Settings</h1>
      <LibraryForm profile={profile} mode="settings" />
      {profile.is_admin && <InvitePanel />}
    </div>
  );
}
