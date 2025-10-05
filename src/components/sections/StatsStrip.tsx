"use client";

import { motion } from "framer-motion";

const STATS = [
  { k: "+18,000", label: "Channels" },
  { k: "+80,000", label: "Movies & Series" },
  { k: "+9,000",  label: "Customers" },
  { k: "24/7",    label: "Support" },
];

export default function StatsStrip() {
  return (
    <section className="py-10 bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-xl border border-white/20 p-5 text-center"
            >
              <div className="text-2xl md:text-3xl font-extrabold">{s.k}</div>
              <div className="mt-1 text-xs md:text-sm opacity-90">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
