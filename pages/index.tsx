export default function Home(){
  return (
    <main style={{padding:24,fontFamily:'Inter, system-ui'}}>
      <h1>Claimate</h1>
      <p>Тестові кнопки підключення:</p>
      <ul>
        <li>
          <a href={
            `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID ?? ''}&scope=read_only&redirect_uri=${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/stripe/callback&state=REPLACE_WITH_USER_ID`
          }>Connect Stripe</a>
        </li>
        <li>
          <a href={`/api/shopify/install?shop=YOURSHOP.myshopify.com&state=REPLACE_WITH_USER_ID`}>Connect Shopify</a>
        </li>
      </ul>
      <small>Замінити REPLACE_WITH_USER_ID на UUID користувача з Supabase Auth.</small>
    </main>
  )
}
