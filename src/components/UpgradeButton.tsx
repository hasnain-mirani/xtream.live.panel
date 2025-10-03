export default function UpgradeButton() {
  const go = async () => {
    const r = await fetch("/api/billing/create-checkout-session", { method: "POST" });
    const j = await r.json();
    if (j?.url) window.location.href = j.url;
  };
  return <button className="btn btn-primary" onClick={go}>Upgrade</button>;
}
