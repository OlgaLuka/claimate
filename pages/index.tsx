import { useEffect, useMemo, useState } from "react";

// валідатор UUID (Supabase auth.users.id)
const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// валідатор my-shop.myshopify.com
const shopRe = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;

export default function Home() {
  const [uid, setUid] = useState("");
  const [shop, setShop] = useState("");

  // пам'ять, бо ти любиш забувати (і я це бачу)
  useEffect(() => {
    setUid(localStorage.getItem("claimate_uid") || "");
    setShop(localStorage.getItem("claimate_shop") || "");
  }, []);
  useEffect(() => localStorage.setItem("claimate_uid", uid), [uid]);
  useEffect(() => localStorage.setItem("claimate_shop", shop), [shop]);

  const uidValid = useMemo(() => uuidRe.test(uid.trim()), [uid]);
  const shopValid = useMemo(() => shopRe.test(shop.trim()), [shop]);

  const stripeHref = useMemo(() => {
    if (!uidValid) return undefined;
    const qs = new URLSearchParams({ state: uid.trim() });
    return `/api/stripe/authorize?${qs}`;
  }, [uidValid, uid]);

  const shopifyHref = useMemo(() => {
    if (!uidValid || !shopValid) return undefined;
    const qs = new URLSearchParams({
      shop: shop.trim().toLowerCase(),
      state: uid.trim(),
    });
    return `/api/shopify/install?${qs}`;
  }, [uidValid, shopValid, uid, shop]);

  return (
    <main style={{ padding: 24, fontFamily: "Inter, system-ui", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Claimate</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        Кроки: підключи Stripe → підключи Shopify → ми підтягнемо диспути/замовлення → згенеруємо та відправимо відповідь.
      </p>

      <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
        0) Твій Supabase UUID (auth.users.id)
      </label>
      <input
        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
        style={{
          padding: 10, width: "100%", borderRadius: 8,
          border: `1px solid ${uid.length === 0 || uidValid ? "#ccc" : "#e00"}`, marginBottom: 16
        }}
      />
      {!uidValid && uid.length > 0 && (
        <div style={{ color: "#e00", fontSize: 12, marginTop: -10, marginBottom: 10 }}>
          Це не схоже на UUID. Supabase → Authentication → Users → колонка ID.
        </div>
      )}

      <section style={{ marginBottom: 28 }}>
        <h3>1) Connect Stripe</h3>
        <p style={{ color: "#666", marginTop: 0, marginBottom: 8, fontSize: 13 }}>
          Кнопка веде на <code>/api/stripe/authorize</code> (бек збирає OAuth з <b>read_write</b>).
        </p>
        <LinkBtn href={stripeHref} disabled={!stripeHref}>Connect Stripe</LinkBtn>
        {!stripeHref && <small style={{ marginLeft: 12, color: "#888" }}>Спочатку введи валідний UUID.</small>}
      </section>

      <section style={{ marginBottom: 28 }}>
        <h3>2) Connect Shopify</h3>
        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>Домен магазину</label>
        <input
          placeholder="your-shop.myshopify.com"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
          style={{
            padding: 10, width: "100%", borderRadius: 8,
            border: `1px solid ${shop.length === 0 || shopValid ? "#ccc" : "#e00"}`, marginBottom: 10
          }}
        />
        {!shopValid && shop.length > 0 && (
          <div style={{ color: "#e00", fontSize: 12, marginBottom: 8 }}>
            Очікується формат <code>your-shop.myshopify.com</code>.
          </div>
        )}
        <LinkBtn href={shopifyHref} disabled={!shopifyHref}>Connect Shopify</LinkBtn>
        {!shopifyHref && <small style={{ marginLeft: 12, color: "#888" }}>UUID + домен повинні бути валідні.</small>}
      </section>

      <div style={{ fontSize: 12 }}>
        <a href="/api/health" style={{ color: "#444" }}>/api/health</a> — перевірка, що бек живий.
      </div>
    </main>
  );
}

function LinkBtn({ href, disabled, children }:{ href?: string; disabled?: boolean; children: React.ReactNode; }) {
  const base: React.CSSProperties = {
    display: "inline-block", padding: "10px 14px", borderRadius: 8,
    border: "1px solid #ddd", background: "#111", color: "#fff",
    textDecoration: "none", cursor: "pointer", fontWeight: 600,
  };
  if (!href || disabled) {
    return <span style={{ ...base, background: "#eee", color: "#888", borderColor: "#e5e5e5", cursor: "not-allowed" }}>{children}</span>;
  }
  return <a href={href} style={base}>{children}</a>;
}
