
import Link from "next/link";

export default function QuickStartCard() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold text-white">Quick start</h2>
      <ol className="mt-3 space-y-2 text-sm list-decimal list-inside text-white/80">
        <li>Install your IPTV app (Fire TV / Android / iOS / Smart TV).</li>
        <li>Enter the credentials from your activation email.</li>
        <li>Browse channels and enjoy. Need help? Contact support.</li>
      </ol>

      <div className="mt-4 grid gap-2">
        <Link href="/how-to-setup" className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
          Setup guides
        </Link>
        <Link href="/support" className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
          Open support ticket
        </Link>
        <Link href="/account" className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
          Account settings
        </Link>
      </div>
    </section>
  );
}
