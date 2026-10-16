"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function InvitePanel() {
  const [emails, setEmails] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data } = await createClient().from("invites").select("email").order("created_at");
    setEmails((data ?? []).map((r) => r.email as string));
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    const { error } = await createClient().from("invites").insert({ email: clean });
    setMsg(error ? error.message : `${clean} can now sign in.`);
    if (!error) { setEmail(""); load(); }
  }
  async function remove(x: string) {
    await createClient().from("invites").delete().eq("email", x);
    load();
  }

  return (
    <section className="card" style={{ marginTop: 40, maxWidth: 640 }}>
      <div className="tape" />
      <div className="caps">Admin</div>
      <h2 className="display" style={{ fontSize: 32, margin: "6px 0 4px" }}>Invite friends</h2>
      <p style={{ marginTop: 0 }}>Only emails on this list can sign in. Each friend gets their own private library.</p>
      <form onSubmit={add} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <label htmlFor="inv" className="sr-only">Friend&apos;s email</label>
        <input id="inv" type="email" className="input" style={{ flex: "1 1 260px" }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="friend@example.com" />
        <button className="btn btn-primary">Add invite</button>
      </form>
      {msg && <p role="status">{msg}</p>}
      <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
        {emails.map((x) => (
          <li key={x} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed rgba(90,58,34,.3)", padding: "6px 0" }}>
            <span>{x}</span>
            <button className="btn btn-ghost" style={{ minHeight: 36, padding: "4px 12px", fontSize: 15 }} onClick={() => remove(x)}>Remove</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
