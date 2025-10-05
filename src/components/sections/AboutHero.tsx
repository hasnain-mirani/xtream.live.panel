"use client";

import { motion } from "framer-motion";

export default function AboutHero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* background poster blur */}
      <div
        className="absolute inset-0 -z-10 bg-[url('/images/posters-wall.jpg')] bg-cover bg-center"
        aria-hidden
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/60 to-black/70" />

      <div className="container mx-auto px-4 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl text-white"
        >
          <p className="text-sm/6 opacity-80">Home › About</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight">
            About us
          </h1>
          <p className="mt-4 text-white/80">
            We deliver premium IPTV with instant activation, crystal-clear
            quality and 24/7 support across all your devices.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
