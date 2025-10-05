"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils"; // if you don't have cn, replace cn(...) with string joins

type QA = { q: string; a: string };

const ITEMS: QA[] = [
  {
    q: "Is Xtream IPTV legal?",
    a:
      "The legality of Xtream IPTV depends on the content provided by the service and your location. Some IPTV services operate legally by acquiring proper licenses for the content they offer, while others might distribute content without proper authorization, which can be illegal.",
  },
  {
    q: "How to use Xtream IPTV?",
    a:
      "To use Xtream IPTV, you need an IPTV app or player that supports Xtream Codes. Once installed, enter the Xtream Codes server URL, along with your username and password provided by the IPTV service. This will give you access to live TV, movies, and other content included in your subscription.",
  },
  {
    q: "What is Xtream IPTV?",
    a:
      "Xtream IPTV is a service that provides live TV channels, movies, and other video content over the internet. It uses the Xtream Codes API, allowing users to access content through compatible IPTV players or apps.",
  },
  {
    q: "How to find a reliable Xtream IPTV service provider?",
    a:
      "Research online reviews, check for responsive customer support, and ensure the provider has proper licensing. A trial can help you assess quality before committing.",
  },
  {
    q: "What are the best IPTV players for Xtream IPTV?",
    a:
      "Popular players include TiviMate, GSE Smart IPTV, Perfect Player, IPTV Smarters Pro, and VLC. They support Xtream Codes and usually offer EPG, nice UIs, and customization.",
  },
  {
    q: "What are the risks of using unauthorized Xtream IPTV services?",
    a:
      "Potential legal issues, malware exposure, sudden shutdowns, and poor reliability. Unauthorized services often operate without proper licensing.",
  },
  {
    q: "What is Xtream Codes IPTV?",
    a:
      "A platform providers use to manage and deliver IPTV content. It enables live TV and VOD via a structured interface with user authentication and content management.",
  },
  {
    q: "How to use Xtream Codes IPTV?",
    a:
      "Use an IPTV app that supports Xtream Codes. Enter the server URL, username, and password from your provider to access your subscription’s content.",
  },
  {
    q: "Is a VPN necessary for using Xtream IPTV?",
    a:
      "Not strictly necessary, but recommended for privacy/security and to avoid possible ISP throttling or regional restrictions.",
  },
  {
    q: "Can Xtream IPTV be used on smart TVs?",
    a:
      "Yes. With compatible apps like Smart IPTV, TiviMate, or IPTV Smarters, you can stream directly on your TV.",
  },
  {
    q: "Can Xtream IPTV be used on mobile devices?",
    a:
      "Yes. Use apps like GSE Smart IPTV, IPTV Smarters Pro, or TiviMate to stream on the go.",
  },
  {
    q: "How to renew or upgrade your Xtream IPTV subscription?",
    a:
      "Renew or upgrade through your provider’s site/app by choosing a plan and completing payment.",
  },
  {
    q: "What should I do if Xtream IPTV is not working?",
    a:
      "Restart your device, check your internet, or reinstall the app. If issues persist, contact your provider’s support.",
  },
];

export default function XtrmFAQ({
  title = "Frequently Asked Questions",
  quote = "“Finally find a provider that delivery service without freeze every few minutes. So far 100% satisfacion. In comparation to other providers this one has got much more channels and movies.”",
  className,
}: { title?: string; quote?: string; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className={cn("py-16 md:py-24 bg-muted/40", className)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h2>
          <p className="mt-3 text-muted-foreground">{quote}</p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-xl border bg-card ring-1 ring-black/5 shadow-sm">
                <button
                  className="w-full px-4 py-3 text-left flex items-center justify-between gap-3"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold">{item.q}</span>
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact block */}
        <div className="mx-auto mt-10 max-w-xl text-center">
          <h3 className="text-lg font-bold">Still have questions?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Can’t find your answer here? Reach out and we’ll help you ASAP.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <a href="/contact" className="rounded-full bg-primary text-primary-foreground px-5 py-2 font-semibold">
              Contact Us
            </a>
            <a href="/trial" className="rounded-full border px-5 py-2 font-semibold hover:bg-background">
              Start Free Trial
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
