import { useState } from "react";

export default function Home() {
  const [uid, setUid] = useState("");                  // Supabase Auth UUID
  const [shop, setShop] = useState("");                // your-shop.myshopify.com

  const stripeHref = uid
    ? `/api/stripe/authorize?state=${encodeURIComponent(uid)}`
    : undefined;

  const shopifyHref = uid && shop
    ? `/api/shopify/install?shop=${encodeURIComponent(shop)}&state=${encodeURIComponent(uid)}`
    : undefined;

  const LinkBtn = (props: { href?: string; children: React.ReactNode }) => {
    const { href, children } = props;
    const disabled = !href;
    const common = {
      padding: "8px 12px",
      border: "1px solid #ccc",
      borderRadius: 6,
      display: "inline-block",
      color: disabled ? "#888" : "#000",
      pointerEvents: disabled ? "none" as const : "auto" as const,
      textDecoration: "none",
    };
    return disabled ? (
      <span style={common as any}>{children}</span>
    ) : (
      <a href={href} style={common as any}>{children}</a>
    );
  };

  return (
    <main style={{ padding: 24, fontFamily: "Inter, system-ui", maxWidth: 640 }}>
      <h1>Claimate</h1>

      <h3>Test user</h3>
      <input
        placeholder="Supabase UUID (auth.users.id)"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
        style={{ padding: 8, width: "100%", marginBottom: 12 }}
      />

      <h3>1) Connect Stripe</h3>
      <p style={{ marginTop: 4, marginBottom: 8, fontSize: 12, color: "#666" }}>
        Використовує серверний редірект /api/stripe/authorize (безпечніше).
      </p>
      <LinkBtn href={stripeHref}>Connect Stripe</LinkBtn>

      <h3 style={{ marginTop: 24 }}>2) Connect Shopify</h3>
      <input
        placeholder="your-shop.myshopify.com"
        value={shop}
        onChange={(e) => setShop(e.target.value)}
        style={{ padding: 8, width: "100%", marginBottom: 8 }}
      />
      <LinkBtn href={shopifyHref}>Connect Shopify</LinkBtn>

      <p style={{ marginTop: 24, fontSize: 12, color: "#666" }}>
        Заповни UUID та домен. Кнопки активуються автоматично.
      </p>
    </main>
  );
}
