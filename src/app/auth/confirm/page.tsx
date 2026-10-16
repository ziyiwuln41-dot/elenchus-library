import HashNotice from "./HashNotice";
// Email links land here. Signing in needs a real tap on the button, so email
// link-scanners (e.g. Microsoft Safe Links) that open links automatically can't use up the link.
export default async function ConfirmPage({ searchParams }: PageProps<"/auth/confirm">) {
  const sp = await searchParams;
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const tokenHash = pick("token_hash");
  const type = pick("type") || "email";
  const code = pick("code");
  const ok = !!(tokenHash || code);

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="card" style={{ width: "100%", maxWidth: 460, padding: "44px 36px", textAlign: "center" }}>
        <div className="tape" />
        <div className="caps">The Elenchus Library</div>
        {ok ? (
          <form action="/auth/verify" method="post" style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 14 }}>
            <h1 className="display" style={{ fontSize: 40, margin: 0, lineHeight: 1.05 }}>One tap and you&apos;re in</h1>
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="code" value={code} />
            <button className="btn btn-primary" style={{ fontSize: 19, minHeight: 52 }}>Enter the library</button>
          </form>
        ) : (
          <div style={{ marginTop: 14 }}>
            <h1 className="display" style={{ fontSize: 36, margin: "0 0 10px" }}>This link can&apos;t sign you in</h1>
            <HashNotice />
            <p>Send a new sign-in email from the login page and type the 6-digit code from it.</p>
            <a className="btn btn-primary" href="/login" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>Back to sign-in</a>
          </div>
        )}
      </div>
    </main>
  );
}
