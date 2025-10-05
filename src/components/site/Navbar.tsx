"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react";
import { useAuthNav } from "@/hook/useAuthNav";
import logo from "@/assets/logo/logo.png";

function cn(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

const NAV = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About Us" },
  { href: "/installation", label: "Installation" },
  { href: "/channels", label: "Channels" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Dashboard" }, // KEEP dashboard visible; protected content will redirect anyway
];

export default function Navbar() {
  const { isLoggedIn, onTrial, user, logout } = useAuthNav();
  const r = useRouter();
  const [open, setOpen] = useState(false);

  const initials = useMemo(() => {
    const n = (user?.name || user?.email || "U").trim();
    return n.split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase()).join("");
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[linear-gradient(180deg,rgba(8,10,22,.9),rgba(8,10,22,.65))] backdrop-blur supports-[backdrop-filter]:bg-black/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-4">
           <Link href="/" className="flex items-center gap-2 group" aria-label="XtreamTV Home">
          <div className="relative h-7 w-7 overflow-hidden rounded-lg ring-2 ring-white/10">
            <Image
              src={logo}
              alt="XtreamTV"
              fill
              sizes="28px"
              className="object-cover"
              priority
            />
          </div>

          <span className="font-extrabold tracking-tight text-lg">
            <span className="bg-gradient-to-r from-rose-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              Xtream
            </span>
            <span className="text-white">TV</span>
          </span>
        </Link>

          <nav className="hidden md:flex items-center gap-6 ml-2 text-sm">
            {NAV.map((n) => {
              const active = r.pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn("transition-colors", active ? "text-white" : "text-white/75 hover:text-white")}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: actions (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {onTrial && (
                <span className="inline-flex items-center rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 text-xs font-medium text-amber-200">
                  Trial
                </span>
              )}

              <div className="relative group">
                <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white hover:bg-white/10">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white text-xs font-bold">
                    {initials}
                  </span>
                  <span className="max-w-[160px] truncate">{user?.name || user?.email}</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </button>

                <div className="absolute right-0 mt-2 hidden w-56 rounded-xl border border-white/10 bg-[#0b0f1f] p-1 text-sm text-white/90 shadow-lg ring-1 ring-black/40 group-hover:block">
                  <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10">
                    <User className="h-4 w-4 opacity-70" />
                    Account & Dashboard
                  </Link>
                  <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-300 hover:bg-white/10">
                    <LogOut className="h-4 w-4 opacity-70" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-rose-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
              >
                FREE TRIAL
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0b0f1f]/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center justify-between py-2">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white text-sm font-bold">
                      {initials}
                    </span>
                    <div className="text-white text-sm">
                      <div className="font-semibold leading-tight">{user?.name || "Account"}</div>
                      <div className="text-white/60 text-xs leading-tight">{user?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onTrial && (
                      <span className="rounded-full border border-amber-300/40 bg-amber-300/15 px-2.5 py-1 text-[11px] font-medium text-amber-200">
                        Trial
                      </span>
                    )}
                    <button
                      onClick={async () => logout()}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-white/80 text-sm">Welcome</div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="rounded-full bg-gradient-to-r from-rose-500 to-indigo-500 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      FREE TRIAL
                    </Link>
                  </div>
                </>
              )}
            </div>

            <nav className="mt-2 grid gap-1">
              {NAV.map((n) => {
                const active = r.pathname === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm",
                      active ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
