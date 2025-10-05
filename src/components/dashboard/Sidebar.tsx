import Link from "next/link";
import cn from "clsx";

export default function Sidebar({ open = true }: { open?: boolean }) {
  return (
    <aside
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4",
        "lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto",
        open ? "block" : "hidden lg:block"
      )}
    >
      <div className="text-xs font-semibold uppercase text-white/60 px-2">Overview</div>
      <nav className="mt-2 space-y-1">
        <SidebarLink href="/dashboard" label="Dashboard" active />
        <SidebarLink href="/channels" label="Browse Channels" />
        <SidebarLink href="/invoice/history" label="Invoices" />
        <SidebarLink href="/account" label="Account Settings" />
        <SidebarLink href="/support" label="Support" />
      </nav>

      <div className="mt-6 text-xs font-semibold uppercase text-white/60 px-2">Shortcuts</div>
      <div className="mt-2 space-y-2">
        <Link className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10" href="/invoice/create">
          Create new invoice
        </Link>
        <Link className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10" href="/installation">
          Device setup guides
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-4">
        <div className="text-sm font-semibold">Need help?</div>
        <p className="mt-1 text-xs text-white/70">
          Our team is here 24/7. Open a ticket and we’ll get back ASAP.
        </p>
        <Link href="/contact" className="mt-3 inline-block rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25">
          Contact support
        </Link>
      </div>
    </aside>
  );
}

function SidebarLink({ href, label, active = false }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-xl px-3 py-2 text-sm border border-transparent",
        active ? "bg-white/20 text-white border-white/10" : "bg-white/5 hover:bg-white/10 border-white/10 text-white/85"
      )}
    >
      {label}
    </Link>
  );
}
