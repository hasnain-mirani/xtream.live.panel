import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

type PlanKey = "trial" | "monthly" | "quarterly" | "yearly";

type FormState = {
  name: string;
  email: string;
  password: string;
  agree: boolean;
  plan: PlanKey;
};

// GBP prices (adjust as you like)
const PLANS: Record<PlanKey, { label: string; amount: number; interval: string }> = {
  trial:     { label: "Free Trial (1 days)", amount: 0,      interval: "wk" },
  monthly:   { label: "Monthly",             amount: 19.99,  interval: "mo" },
  quarterly: { label: "Quarterly",           amount: 49.99,  interval: "qtr" },
  yearly:    { label: "Yearly",              amount: 169.00, interval: "yr" },
};

const CURRENCY = "GBP";

const initial: FormState = { name: "", email: "", password: "", agree: true, plan: "monthly" };

export default function RegisterPage() {
  const r = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(form.email.trim()), [form.email]);
  const nameValid = form.name.trim().length >= 2;
  const pwValid = form.password.length >= 8;
  const canSubmit = nameValid && emailValid && pwValid && form.agree && !loading;

  const selectedPlan = PLANS[form.plan];
  const priceLabel = new Intl.NumberFormat(undefined, { style: "currency", currency: CURRENCY }).format(selectedPlan.amount);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          plan: form.plan, // ✅ send the selected plan
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      r.push(`/invoice/${json.invoiceId}`);
    } catch (e: any) {
      setErr(e?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (err) setErr(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, form.email, form.password, form.plan]);

  return (
    <main className="min-h-[80vh] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-white/60 backdrop-blur p-6 shadow-sm">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-gray-600">
              Start your free trial—no card required. An invoice with bank details will be emailed.
            </p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Plan selector */}
            <div>
              <label htmlFor="plan" className="block text-sm font-medium">Choose a plan</label>
             <select
  id="plan"
  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
  value={form.plan}
  onChange={(e) => setForm((s) => ({ ...s, plan: e.target.value as PlanKey }))}
>
  <option value="trial">Free Trial (1 days) — Free</option>
  <option value="monthly">Monthly — {new Intl.NumberFormat(undefined, { style: "currency", currency: CURRENCY }).format(PLANS.monthly.amount)}</option>
  <option value="quarterly">Quarterly — {new Intl.NumberFormat(undefined, { style: "currency", currency: CURRENCY }).format(PLANS.quarterly.amount)}</option>
  <option value="yearly">Yearly — {new Intl.NumberFormat(undefined, { style: "currency", currency: CURRENCY }).format(PLANS.yearly.amount)}</option>
</select>
<p className="mt-1 text-xs text-gray-600">
  You’ll be invoiced:{" "}
  <b>
  {loading
  ? "Creating your account…"
  : `Create account • ${
      PLANS[form.plan].amount === 0
        ? "Free"
        : new Intl.NumberFormat(undefined, { style: "currency", currency: CURRENCY }).format(PLANS[form.plan].amount)
    }`}
    </b>
  ({PLANS[form.plan].label})
</p>

              <p className="mt-1 text-xs text-gray-600">
                You’ll be invoiced: <b>{priceLabel}</b> ({selectedPlan.label})
              </p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium">Full name</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none transition
                  ${!nameValid && form.name ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-black/10"}`}
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              />
              {!nameValid && form.name && <p className="mt-1 text-xs text-red-600">Please enter at least 2 characters.</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`mt-1 w-full rounded-lg border px-3 py-2 outline-none transition
                  ${!emailValid && form.email ? "border-red-400 focus:ring-2 focus:ring-red-200" : "border-gray-300 focus:ring-2 focus:ring-black/10"}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
              {!emailValid && form.email && <p className="mt-1 text-xs text-red-600">Enter a valid email.</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <div className="mt-1 flex rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-black/10">
                <input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full rounded-l-lg px-3 py-2 outline-none"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="rounded-r-lg px-3 text-sm text-gray-600 hover:text-black"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {!pwValid && form.password && <p className="mt-1 text-xs text-red-600">Minimum 8 characters.</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                id="agree"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300"
                checked={form.agree}
                onChange={(e) => setForm((s) => ({ ...s, agree: e.target.checked }))}
              />
              <label htmlFor="agree" className="text-sm text-gray-700">
                I agree to the{" "}
                <a href="/terms" className="underline underline-offset-2">Terms</a> and{" "}
                <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.
              </label>
            </div>

            {/* Error */}
            {err && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {err}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full rounded-lg px-4 py-2.5 font-medium text-white transition
                ${canSubmit ? "bg-black hover:opacity-90" : "bg-black/40 cursor-not-allowed"}`}
            >
              {loading ? "Creating your account…" : `Create account • ${priceLabel}`}
            </button>

            <p className="text-center text-xs text-gray-500">
              You’ll be redirected to your invoice and receive an email with payment details.
            </p>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="font-medium underline underline-offset-2">Sign in</a>
        </p>
      </div>
    </main>
  );
}
