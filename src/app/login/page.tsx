"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(
    params.get("error") === "link" ? "That sign-in link had already been used or expired. Send a new one, and use the code in it if the link misbehaves." : null,
  );
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setState("sending");
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    if (error) {
      setState("idle");
      setError(/database error|invite/i.test(error.message) ? "This library is invite-only. Ask Ziyi to add your email first." : error.message);
      return;
    }
    setState("sent");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setChecking(true);
    const { error } = await createClient().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setChecking(false);
    if (error) return setError("That code didn't work. Check it, or send a fresh email.");
    router.push("/");
    router.refresh();
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 18, margin: 0 }}>
              An email is on its way to <strong>{email}</strong>. Tap its button, or type the code from it here:
            </p>
            <form onSubmit={verifyCode} style={{ display: "flex", gap: 8 }}>
              <label htmlFor="otp" className="sr-only">Code from the email</label>
              <input
                id="otp" className="input" inputMode="numeric" autoComplete="one-time-code" placeholder="123456"
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
                style={{ flex: 1, fontSize: 24, letterSpacing: ".3em", textAlign: "center" }}
              />
              <button className="btn btn-primary" disabled={checking || code.length < 6}>{checking ? "…" : "Enter"}</button>
            </form>
            {error && <p role="alert" style={{ margin: 0, color: "#7a2a1c" }}>{error}</p>}
            <button className="btn btn-ghost" onClick={() => { setState("idle"); setCode(""); }}>Use a different email</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {error && <p role="alert" style={{ margin: 0, color: "#7a2a1c" }}>{error}</p>}
            <button className="btn btn-primary" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Send me a sign-in email"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
