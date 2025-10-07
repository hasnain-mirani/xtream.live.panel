"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const ITEMS = [
  "Smart TV (Samsung, LG, etc.)",
  "All AndroidTV TVs",
  "Android TV Box",
  "Apple TV / iOS",
  "IPTV Receivers (MAG, Enigma2, Formuler)",
  "Android & iPhone",
  "Computers (Linux, macOS, Windows)",
];

export default function Equipment() {
  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4 grid items-center md:grid-cols-2 gap-10 md:gap-16">
        <div>
          <h3 className="text-xl md:text-3xl font-extrabold">
            Full Working Equipments of XtrmIPTV
          </h3>
          <p className="mt-3 text-muted-foreground">
            Enjoy premium live TV in stunning quality with a secure and seamless experience.
          </p>

          <ul className="mt-5 space-y-2 text-sm">
            {ITEMS.map((t) => (
              <li key={t} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="rounded-2xl border bg-card ring-1 ring-black/5 shadow-xl overflow-hidden">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src="/assets/devices.png"
                alt="Devices"
                fill
                className="object-contain md:object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
