"use client";

import { motion } from "framer-motion";

export default function InstallHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-[url('/images/posters-wall.jpg')] bg-cover bg-center"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/70 to-black/80" />
      <div className="container mx-auto px-4 py-20 md:py-28 text-white">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm/6 opacity-80"
        >
          Home › Installation
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight"
        >
          IPTV Installation Guide
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4 text-white/85 max-w-3xl"
        >
          Set up <strong>XtrmIPTV</strong> on any device in minutes. Follow the step-by-step
          guide for your platform and start watching instantly.
        </motion.p>
      </div>
    </section>
  );
}
