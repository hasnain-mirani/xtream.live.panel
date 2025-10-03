import { useEffect } from "react";
import Link from "next/link";

export default function Success() {
  useEffect(() => {
    fetch("/api/subscription/activate", { method: "POST" }).catch(()=>{});
  }, []);

  return (
    <main className="my-10">
      <h1 className="text-2xl font-bold">Payment Successful</h1>
      <p className="mt-2">Your subscription is now <b>active</b>.</p>
      <div className="mt-4 flex gap-3">
        <Link href="/watch"><button className="btn btn-primary">Start Watching</button></Link>
        <Link href="/dashboard"><button className="btn">Go to Dashboard</button></Link>
      </div>
    </main>
  );
}
