import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PaletteKey, WoodKey } from "@/lib/style";

export type Profile = {
  id: string;
  display_name: string | null;
  library_name: string | null;
  wood: WoodKey;
  palette: PaletteKey;
  palette_custom: string[] | null;
  shelf_names: { books?: string; current?: string; research?: string };
  is_admin: boolean;
  onboarded: boolean;
  starter_seeded: boolean;
};

export async function requireProfile(opts: { allowUnonboarded?: boolean } = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = data as Profile | null;
  if (!profile) redirect("/login");
  if (!profile.onboarded && !opts.allowUnonboarded) redirect("/setup");
  return { supabase, user, profile };
}

export function shelfName(p: Profile, key: "books" | "current" | "research") {
  const defaults = { books: "Books", current: "Current Affairs", research: "Research & Literature" };
  return p.shelf_names?.[key]?.trim() || defaults[key];
}
