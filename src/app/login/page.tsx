"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    if (error) {
      setState("idle");
      setError(
        /database error|invite/i.test(error.message)
          ? "This library is invite-only. Ask Ziyi to add your email first."
          : error.message,
      );
      return;
    }
    setState("sent");
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="card" style={{ width: "100%", maxWidth: 460, padding: "44px 36px" }}>
        <div className="tape" />
        <div className="caps">General Paper · A private library</div>
        <h1 className="display" style={{ fontSize: 48, lineHeight: 1, margin: "10px 0 6px" }}>
          The Elenchus <em style={{ fontWeight: 500, color: "var(--umber)" }}>Library</em>
        </h1>
        <p style={{ margin: "0 0 24px", color: "#4a3b26" }}>
          Elenchus (ἔλεγχος): Socrates&apos; way of testing a claim until it holds or falls.
        </p>

        {state === "sent" ? (
          <p style={{ fontSize: 18 }}>
            A sign-in link is on its way to <strong>{email}</strong>. Open it on this device to enter your library.
          </p>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {error && <p role="alert" style={{ margin: 0, color: "#7a2a1c" }}>{error}</p>}
            <button className="btn btn-primary" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Send me a sign-in link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
