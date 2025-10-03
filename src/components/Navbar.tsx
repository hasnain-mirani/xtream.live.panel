// src/components/site/Navbar.tsx
import Link from "next/link";
import { useEffect, useState } from "react";

type Me = { id: string; name?: string; email: string } | null;
type Sub = { status?: "none" | "trial" | "active" | "canceled" | string } | null;

export default function Navbar() {
  const [me, setMe] = useState<Me>(null);
  const [sub, setSub] = useState<Sub>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const t = Date.now(); // cache-buster so state is always fresh
      try {
        const [rMe, rSub] = await Promise.all([
          fetch(`/api/auth/me?t=${t}`, { cache: "no-store" }),
          fetch(`/api/subscription/me?t=${t}`, { cache: "no-store" }),
        ]);
        if (!ignore) {
          setMe(rMe.ok ? (await rMe.json()).user : null);
          setSub(rSub.ok ? await rSub.json() : { status: "none" });
        }
      } catch {
        if (!ignore) { setMe(null); setSub({ status: "none" }); }
      }
    })();
    return () => { ignore = true; };
  }, []);

  const isLoggedIn = !!me;
  const isOnTrial = sub?.status === "trial";
  const canShowFreeTrial = !isLoggedIn && (sub?.status === "none" || !sub?.status);

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    location.reload(); // refresh navbar state instantly
  };

  return (
    <header className="sticky top-0 z-40 bg-black/70 backdrop-blur border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-extrabold tracking-wider">
            <span className="text-rose-500">X</span><span className="text-white">tream</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-6 text-sm text-white/80">
            <Link className="hover:text-white" href="/pricing">Pricing</Link>
            <Link className="hover:text-white" href="/about">About Us</Link>
            <Link className="hover:text-white" href="/installation">Installation</Link>
            <Link className="hover:text-white" href="/channels">Channels</Link>
            <Link className="hover:text-white" href="/faq">FAQ</Link>
            <Link className="hover:text-white" href="/contact">Contact</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {isOnTrial && (
                <span className="rounded-full bg-amber-600/90 px-3 py-1 text-xs font-semibold text-white/90">
                  Trial
                </span>
              )}
              <button
                onClick={onLogout}
                className="rounded-full bg-white text-black hover:bg-gray-100 px-4 py-2 text-sm font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/90 hover:text-white"
              >
                Login
              </Link>
              {canShowFreeTrial && (
                <Link
                  href="/auth/register?trial=1"
                  className="rounded-full bg-white text-black hover:bg-gray-100 px-4 py-2 text-sm font-semibold"
                >
                  FREE TRIAL
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
