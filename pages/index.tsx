// pages/index.tsx
import { useEffect, useMemo, useState } from "react";

/** Проста перевірка UUID з Supabase (auth.users.id) */
const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Дозволяємо щось типу my-shop-uk.myshopify.com */
const shopRe = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i;

export default function Home() {
  const [uid, setUid] = useState("");
  const [shop, setShop] = useState("");

  // Пам'ятаємо останні значення (щоб після перезавантаження не плакати)
  useEffect(() => {
    setUid(localStorage.getItem("claimate_uid") || "");
    setShop(localStorage.getItem("claimate_shop") || "");
  }, []);
  useEffect(() => {
    localStorage.setItem("claimate_uid", uid);
  }, [uid]);
  useEffect(() => {
    localStorage.setItem("claimate_shop", shop);
  }, [shop]);

  const uidValid = useMemo(() => uuidRe.test(uid.trim()), [uid]);
  const shopValid = useMemo(() => shopRe.test(shop.trim()), [shop]);

  // Готуємо посилання тільки коли все валідне
  const stripeHref = useMemo(() => {
    if (!uidValid) return undefined;
    // Серверний редірект: /api/stripe/authorize → всередині scope=read_write і коректний redirect_uri
    const qs = new URLSearchParams({ state: uid.trim() });
    return `/api/stripe/authorize?${qs.toString()}`;
  }, [uidValid, uid]);

  const shopifyHref = useMemo(() => {
    if (!uidValid || !shopValid) return undefined;
    const qs = new URLSearchParams({
      shop: shop.trim().toLowerCase(),
      state: uid.trim(),
    });
    return `/api/shopify/install?${qs.toString()}`;
  }, [uidValid, shopValid, uid, shop]);

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Claimate</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        підключи Stripe та Shopify, ми підтягнемо диспути і дані замовлень, а
        потім згенеруємо й відправимо відповідь. ти тільки не дихай на прод.
      </p>

      {/* UUID */}
      <section style={{ marginBottom: 18 }}>
        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
          0) Твій Supabase UUID (auth.users.id)
        </label>
        <input
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          style={{
            padding: 10,
            width: "100%",
            borderRadius: 8,
            border: `1px solid ${uid.length === 0 || uidValid ? "#ccc" : "#e00"}`,
            outline: "none",
          }}
        />
        {!uidValid && uid.length > 0 && (
          <div style={{ color: "#e00", fontSize: 12, marginTop: 6 }}>
            схоже не UUID. відкрий Supabase → Authentication → Users і скопіюй
            поле ID.
          </div>
        )}
      </section>

      {/* Stripe */}
      <section style={{ marginBottom: 28 }}>
        <h3 style={{ margin: "8px 0" }}>1) Connect Stripe</h3>
        <p style={{ color: "#666", marginTop: 0, marginBottom: 8, fontSize: 13 }}>
          Кнопка веде на <code>/api/stripe/authorize</code>, де ми збираємо
          правильне OAuth-посилання з <b>read_write</b>.
        </p>
        <LinkBtn href={stripeHref} disabled={!stripeHref}>
          Connect Stripe
        </LinkBtn>
        {!stripeHref && (
          <small style={{ marginLeft: 12, color: "#888" }}>
            введи валідний UUID, будь ласка (ми в 2025-му, а не в печері).
          </small>
        )}
      </section>

      {/* Shopify */}
      <section style={{ marginBottom: 28 }}>
        <h3 style={{ margin: "8px 0" }}>2) Connect Shopify</h3>
        <label style={{ fontWeight: 600, display: "block", marginBottom: 6 }}>
          Домен магазину
        </label>
        <input
          placeholder="your-shop.myshopify.com"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
          style={{
            padding: 10,
            width: "100%",
            borderRadius: 8,
            border: `1px solid ${shop.length === 0 || shopValid ? "#ccc" : "#e00"}`,
            outline: "none",
            marginBottom: 10,
          }}
        />
        {!shopValid && shop.length > 0 && (
          <div style={{ color: "#e00", fontSize: 12, marginBottom: 8 }}>
            формат має бути <code>your-shop.myshopify.com</code>. нічого
            особистого, просто правила.
          </div>
        )}
        <LinkBtn href={shopifyHref} disabled={!shopifyHref}>
          Connect Shopify
        </LinkBtn>
        {!shopifyHref && (
          <small style={{ marginLeft: 12, color: "#888" }}>
            потрібні валідні UUID і домен магазину.
          </small>
        )}
      </section>

      {/* Допоміжні посилання */}
      <section style={{ marginTop: 24, color: "#666" }}>
        <div style={{ fontSize: 12 }}>
          <a href="/api/health" style={{ color: "#444" }}>
            /api/health
          </a>{" "}
          — перевірка, що бек живий.
        </div>
        {/* розкоментуй, якщо додавала /api/status
        <div style={{ fontSize: 12 }}>
          <a href="/api/status" style={{ color: "#444" }}>/api/status</a> — булі по
          ENV без розкриття секретів.
        </div>
        */}
      </section>
    </main>
  );
}

/** Кнопка-лінк з "disabled" станом без зайвих бібліотек */
function LinkBtn({
  href,
  disabled,
  children,
}: {
  href?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const baseStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#111",
    color: "#fff",
    textDecoration: "none",
    cursor: "pointer",
    fontWeight: 600,
  };

  if (disabled || !href) {
    return (
      <span
        style={{
          ...baseStyle,
          background: "#eee",
          color: "#888",
          borderColor: "#e5e5e5",
          cursor: "not-allowed",
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <a href={href} style={baseStyle}>
      {children}
    </a>
  );
}
