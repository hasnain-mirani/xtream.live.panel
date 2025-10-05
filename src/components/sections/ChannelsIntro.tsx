"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";

const BULLETS = [
  "22,000+ Live TV Channels",
  "Stable & Buffer-Free Experience",
  "4K, Full HD & SD Options",
  "Compatible with All IPTV Players",
  "Fast & Secure Servers",
];

export default function ChannelsIntro() {
  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 grid items-center gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold">IPTV Channels List</h2>
          <p className="mt-3 text-muted-foreground">
            A massive selection across sports, movies, news, entertainment, and more—something for everyone.
          </p>
          <ul className="mt-5 space-y-3">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* diamond collage placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-md"
        >
          <div className="rounded-2xl border bg-card ring-1 ring-black/5 shadow-xl overflow-hidden p-6 grid grid-cols-3 gap-2 rotate-45">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-md -rotate-45">
                <Image
                  src={`/images/collage/${(i%6)+1}.jpg`} // replace with your thumbs
                  alt="Channel collage"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
