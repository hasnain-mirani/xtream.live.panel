"use client";

import { motion } from "framer-motion";
import { Tv2, BadgeDollarSign, BadgeCheck, Sparkles, HeadphonesIcon, Clock8 } from "lucide-react";

const FEATURES = [
  {
    icon: Tv2,
    title: "Record Your Shows",
    desc: "Record channels directly on supported devices.",
  },
  {
    icon: Sparkles,
    title: "4K & FHD Quality",
    desc: "Choose 4K or FHD for the best viewing experience.",
  },
  {
    icon: BadgeDollarSign,
    title: "No Extra Charges",
    desc: "All features included — no hidden fees.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Email Support",
    desc: "Real people answering real questions, anytime.",
  },
  {
    icon: BadgeCheck,
    title: "Free Trial",
    desc: "Test the service before committing to a plan.",
  },
  {
    icon: Clock8,
    title: "Complete Compatibility",
    desc: "Firestick, Android TV, MAG, Smart TV, phone, and more.",
  },
];

export default function WhyChoose() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold">Why Choose XtrmIPTV?</h2>
          <p className="mt-3 text-muted-foreground">
            Premium streams, instant activation, and powerful features on every device.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="group rounded-2xl border bg-card p-6 ring-1 ring-black/5 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
