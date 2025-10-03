import Link from "next/link";
import { useRouter } from "next/router";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/channels", label: "Channels" },
  { href: "/admin/programs", label: "EPG / Programs" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const r = useRouter();
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      {/* sidebar */}
      <aside className="border-r p-4">
        <div className="font-extrabold text-lg mb-4">XtremeTV Admin</div>
        <nav className="space-y-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-xl px-3 py-2 text-sm hover:bg-neutral-100 ${r.pathname===l.href ? "bg-neutral-100 font-medium" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Separator className="my-4" />
        <Button variant="outline" className="rounded-2xl w-full" onClick={logout}>Logout</Button>
      </aside>

      {/* main */}
      <div className="flex flex-col">
        <header className="h-14 border-b flex items-center px-5 justify-between">
          <div className="font-semibold">Admin Portal</div>
          <div className="text-sm opacity-70">v0.1 MVP</div>
        </header>
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
