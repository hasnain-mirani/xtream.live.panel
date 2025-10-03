import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOnly({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"checking" | "ok" | "nope">("checking");

  useEffect(() => {
    fetch("/api/admin/me")
      .then(async (r) => setState(r.ok ? "ok" : "nope"))
      .catch(() => setState("nope"));
  }, []);

  if (state === "checking") return <main className="p-6">Loading…</main>;
  if (state === "nope")
    return (
      <main className="p-6 text-red-600">
        Admins only. <Link className="underline ml-2" href="/admin/login">Go to admin login</Link>
      </main>
    );
  return <>{children}</>;
}
