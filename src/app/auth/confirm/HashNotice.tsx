"use client";

import { useSyncExternalStore } from "react";

// Supabase reports a used-up link in the part of the URL after "#", which only the browser can see.
function read() {
  const h = new URLSearchParams(window.location.hash.slice(1));
  return h.get("error_code") ?? h.get("error") ?? "";
}

export default function HashNotice() {
  const code = useSyncExternalStore(() => () => {}, read, () => "");
  if (!code) return null;
  return (
    <p role="alert" style={{ margin: "12px 0 0", color: "#7a2a1c" }}>
      This link was already used, probably by your email provider&apos;s security scanner, which opens links before you do.
      Go back, send a new email, and type the code from it instead of tapping the link.
    </p>
  );
}
