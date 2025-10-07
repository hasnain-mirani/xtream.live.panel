"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Send, AppWindow, Play } from "lucide-react";

const STEPS = [
  {
    icon: Send,
    title: "Choose Plan",
    desc: "Pick the plan that fits. Instant activation after checkout.",
  },
  {
    icon: AppWindow,
    title: "Install App",
    desc: "Use any IPTV app on Smart TV, Apple TV, Android TV, and more.",
  },
  {
    icon: Play,
    title: "Enjoy Watching",
    desc: "Stream premium channels and VOD anywhere, anytime.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 grid items-center gap-10 md:gap-16 md:grid-cols-2">
        <div className="relative">
          <div className="rounded-2xl border bg-card ring-1 ring-black/5 shadow-xl overflow-hidden">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/assets/iptv.jpg"
                alt="Watching TV"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl md:text-3xl font-extrabold">
            How to get XtrmIPTV service?
          </h3>
          <p className="mt-3 text-muted-foreground">
            High-quality live channels and VOD — without cable hassle.
          </p>

          <div className="mt-6 space-y-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="flex gap-4"
              >
                <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
