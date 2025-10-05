"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Mail, MapPin, Phone, Clock, ExternalLink,
  Facebook, Twitter, Youtube, Instagram, Dribbble, Linkedin, Globe
} from "lucide-react";
import { cn } from "@/lib/utils"; // if not present, replace cn(...) with string joins
import logo from "@/assets/logo/logo.png";
import Image from "next/image";
type NavCol = { title: string; links: { label: string; href: string }[] };

const NAV: NavCol[] = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Channels", href: "/channels" },
      { label: "Installation", href: "/installation" },
      { label: "Free Trial", href: "/trial" },
      { label: "IPTV Reseller", href: "/reseller" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Refund & Return", href: "/legal/refund" },
      { label: "Acceptable Use", href: "/legal/aup" },
    ],
  },
];

const SOCIAL = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Twitter, href: "https://x.com", label: "Twitter/X" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Dribbble, href: "https://dribbble.com", label: "Dribbble" },
];

export default function XtrmFooter({
  className,
}: { className?: string }) {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className={cn("mt-16 border-t bg-muted/40", className)}>
      {/* Top strip: trust + status */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3 text-xs flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground">
              Service Status: <span className="text-foreground font-medium">All systems operational</span>
            </span>
          </div>
          <div className="flex items-center gap-5 text-muted-foreground">
            <span>99.95% Uptime</span>
            <span>24/7 Support</span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:gap-12 lg:gap-16 grid-cols-1 md:grid-cols-12">
          {/* Brand & newsletter */}
          <div className="md:col-span-4 lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="max-w-sm"
            >
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
                </Link>
                {/* You may want to close this div here if it was opened for layout purposes */}
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                XtrmIPTV brings premium live TV, sports, movies and EPG to every device with instant activation.
              </p>

              {/* Contact chips */}
              <div className="mt-4 space-y-2 text-sm">
                <a href="mailto:support@xtreamiptv.tv" className="flex items-center gap-2 hover:text-foreground">
                  <Mail className="h-4 w-4" /> support@xtremetv.live
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-foreground">
                  <Phone className="h-4 w-4" /> +44 7449275072    
                </a>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" /> 24/7 Live Chat & Tickets
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Remote-first, Global
                </div>
              </div>

              {/* Newsletter */}
              <form
                onSubmit={(e) => { e.preventDefault(); alert("Subscribed! (wire to your API)"); }}
                className="mt-6"
              >
                <label className="text-xs font-semibold tracking-wide">Get updates & promo codes</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-95">
                    Subscribe
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">No spam. Unsubscribe any time.</p>
              </form>
            </motion.div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-5 lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-8">
            {NAV.map((col) => (
              <nav key={col.title}>
                <h4 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">{col.title}</h4>
                <ul className="mt-3 space-y-2 text-sm">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-muted-foreground hover:text-foreground">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Social + app/pay badges + selectors */}
          <div className="md:col-span-3 lg:col-span-2 flex flex-col gap-6">
            {/* Social */}
            <div>
              <h4 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Follow us</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {SOCIAL.map(({ icon: Icon, href, label }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background hover:scale-105 transition"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* App / OTT badges (placeholders as buttons) */}
            <div>
              <h4 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Compatible with</h4>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {["Android TV", "Fire TV", "Apple iOS", "Samsung/LG", "MAG/Enigma2", "Kodi"].map((t) => (
                  <span key={t} className="inline-flex items-center justify-center rounded-xl border bg-card px-3 py-2 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Language / Currency */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select className="w-full appearance-none rounded-xl border bg-background px-3 py-2 text-sm">
                  {["English", "Français", "Deutsch", "العربية"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
                <Globe className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <select className="w-full rounded-xl border bg-background px-3 py-2 text-sm">
                {["USD $", "EUR €", "GBP £", "PKR ₨"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Payment icons */}
            <div>
              <h4 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">We accept</h4>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {["visa", "mastercard", "amex", "paypal", "applepay", "googlepay"].map((p) => (
                  <span key={p} className="inline-flex items-center rounded-lg border bg-card px-2.5 py-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-muted-foreground">
            © {year} XtrmIPTV. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Link href="/sitemap" className="hover:text-foreground inline-flex items-center gap-1">
              Sitemap <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Link href="/legal/cookies" className="hover:text-foreground">
              Cookies
            </Link>
            <a href="#top" className="rounded-full border bg-background px-3 py-1 hover:scale-105 transition">Back to top</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
