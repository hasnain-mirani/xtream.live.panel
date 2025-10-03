import Protected from "@/components/Protected";

export default function Upgrade() {
  const createCheckout = async () => {
    // stub for Stripe: POST /api/billing/create-checkout-session then redirect to url
    alert("Stripe checkout stub. Will integrate after validation.");
  };

  return (
    <Protected>
      <main style={{maxWidth: 720, margin:"40px auto", padding: 16}}>
        <h1>Upgrade</h1>
        <p>This is a stub page for payments. We’ll wire Stripe test mode later.</p>
        <button onClick={createCheckout}>Proceed to Checkout (Stub)</button>
      </main>
    </Protected>
  );
}
