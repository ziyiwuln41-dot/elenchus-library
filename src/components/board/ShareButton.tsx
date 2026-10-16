"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type Member = { user_id: string; role: "editor" | "viewer"; name: string };

export default function ShareButton({ scrapbookId, isOwner, members, ownerName, me }: { scrapbookId: string; isOwner: boolean; members: Member[]; ownerName: string; me: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [msg, setMsg] = useState<string | null>(null);
  const supabase = createClient();

  async function share(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const { data, error } = await supabase.rpc("share_scrapbook", { sid: scrapbookId, member_email: email, member_role: role });
    if (error) return setMsg(error.message.replace(/^.*?:\s*/, ""));
    setMsg(`Shared with ${data}.`);
    setEmail("");
    router.refresh();
  }
  async function removeMember(uid: string) {
    await supabase.from("scrapbook_members").delete().eq("scrapbook_id", scrapbookId).eq("user_id", uid);
    if (uid === me) router.push("/scrapbooks");
    else router.refresh();
  }
  async function setMemberRole(uid: string, r: string) {
    await supabase.from("scrapbook_members").update({ role: r }).eq("scrapbook_id", scrapbookId).eq("user_id", uid);
    router.refresh();
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        {members.length ? `Shared · ${members.length + 1}` : "Share"}
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Share scrapbook" style={{ position: "fixed", inset: 0, background: "rgba(40,28,14,.45)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ width: "min(520px, 100%)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="tape" />
            <h2 className="display" style={{ fontSize: 30, margin: 0 }}>Work on this together</h2>
            <p style={{ margin: 0 }}>Anyone you add sees this scrapbook live: notes, moves and cursors as they happen.</p>
            {isOwner && (
              <form onSubmit={share} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <label htmlFor="sh-email" className="sr-only">Friend&apos;s email</label>
                <input id="sh-email" className="input" type="email" required placeholder="friend's email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: "1 1 220px" }} />
                <label htmlFor="sh-role" className="sr-only">Role</label>
                <select id="sh-role" className="input" value={role} onChange={(e) => setRole(e.target.value as "editor" | "viewer")}>
                  <option value="editor">Can edit</option>
                  <option value="viewer">Can view</option>
                </select>
                <button className="btn btn-primary">Share</button>
              </form>
            )}
            {msg && <p role="status" style={{ margin: 0 }}>{msg}</p>}
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed rgba(90,58,34,.3)", padding: "6px 0" }}>
                <span>{ownerName}</span><span style={{ fontStyle: "italic", color: "var(--umber)" }}>Owner</span>
              </li>
              {members.map((m) => (
                <li key={m.user_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderBottom: "1px dashed rgba(90,58,34,.3)", padding: "6px 0" }}>
                  <span>{m.name}{m.user_id === me ? " (you)" : ""}</span>
                  <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {isOwner ? (
                      <select aria-label={`Role for ${m.name}`} className="input" style={{ minHeight: 36, padding: "4px 8px" }} value={m.role} onChange={(e) => setMemberRole(m.user_id, e.target.value)}>
                        <option value="editor">Can edit</option><option value="viewer">Can view</option>
                      </select>
                    ) : (
                      <span style={{ fontStyle: "italic", color: "var(--umber)" }}>{m.role === "editor" ? "Can edit" : "Can view"}</span>
                    )}
                    {(isOwner || m.user_id === me) && (
                      <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 10px", fontSize: 14 }} onClick={() => removeMember(m.user_id)}>
                        {m.user_id === me ? "Leave" : "Remove"}
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <button className="btn btn-ghost" onClick={() => setOpen(false)} style={{ alignSelf: "flex-end" }}>Done</button>
          </div>
        </div>
      )}
    </>
  );
}
