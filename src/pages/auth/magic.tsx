import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Magic() {
  const router = useRouter();
  const [status, setStatus] = useState("Authenticating...");

  useEffect(() => {
    const token = String(router.query.token || "");
    if (!token) return;
    (async () => {
      const r = await fetch("/api/auth/magic", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ token }) });
      if (r.ok) router.replace("/dashboard"); else setStatus("Invalid/expired magic token");
    })();
  }, [router.query.token, router]);

  return <main className="max-w-md mx-auto my-10">{status}</main>;
}
