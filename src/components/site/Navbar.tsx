import Link from "next/link";
import Image from "next/image";


import { useAuthNav } from "@/hook/useAuthNav";
// ...inside the component

// ...in the JSX right-side actions


export default function Navbar() {
    const { isLoggedIn, onTrial, logout } = useAuthNav();
  return (
    <header className="sticky top-0 z-40 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/50 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {/* Replace with your logo asset if you have it */}
            <div className="text-2xl font-extrabold tracking-wider">
              <span className="text-rose-500">X</span>
              <span className="text-white">tream</span>
            </div>
          </Link>
        <nav className="hidden md:flex items-center gap-6 ml-6 text-sm text-white/80">
  <a href="/pricing" className="hover:text-white">Pricing</a>
  <a href="/about" className="hover:text-white">About Us</a>
  <a href="/installation" className="hover:text-white">Installation</a>
  <a href="/channels" className="hover:text-white">Channels</a>
  <a href="/faq" className="hover:text-white">FAQ</a>
  <a href="/contact" className="hover:text-white">Contact</a>
  <a href="/dashboard" className="hover:text-white">Dashboard</a>
</nav>
        </div>

        <div className="flex items-center gap-3">
{isLoggedIn ? (
  <>
    {onTrial && <span className="badge badge-warning">Trial</span>}
    <button onClick={logout} className="btn btn-white">Logout</button>
  </>
) : (
  <>
    <Link href="/auth/login" className="btn btn-ghost">Login</Link>
    <Link href="/auth/register?trial=1" className="btn btn-white">FREE TRIAL</Link>
  </>
)}

        </div>
      </div>
    </header>
  );
}
