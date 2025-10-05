"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // if you don't have cn, replace cn(...) with the string directly

import hero from "@/assets/hero.png";
type Props = {
  title?: string;
  kicker?: string;
  description?: string;
  features?: string[];
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

const DEFAULT_FEATURES = [
  "Premium channels",
  "HD & 4K Image Quality",
  "24/7 Customer Support",
  "Anti-Freeze Technology",
  "Including TV Guide (EPG)",
  "Concurrent Connections",
  "Support All devices",
  "Movies & Series",
  "Boxing MMA PPV",
  "NFL, MLB,..., Etc",
];

export default function XtrmFeatureSection({
  title = "Stream all your favorite TV Shows at Xtream IPTV",
  kicker = "INTRODUCING XTREAM IPTV",
  description = `Elevate your TV experience to new heights with THE ULTIMATE Xtream IPTV EXPERIENCE.
Discover a world of possibilities with over 18,000 live channels, +8,400 series, and +60,000 movies.
From sports and news to action, kids, international, local, HD, and UHD — enjoy limitless entertainment on all your devices.
Find the content you love and redefine your TV experience.`,
  features = DEFAULT_FEATURES,
   // replace with your actual asset path
  imageAlt = "Living room TV with streaming app",
  className,
}: Props) {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 md:gap-14 lg:gap-20 md:grid-cols-2">
          {/* Image card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-2xl border bg-card shadow-xl ring-1 ring-black/5 overflow-hidden">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={hero}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Text + features */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          >
            {/* Kicker pill */}
            <div className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-3 py-1 text-[12px] font-medium tracking-wide">
              {kicker}
            </div>

            <h2 className="mt-4 text-3xl leading-tight font-bold sm:text-4xl">
              {title}
            </h2>

            <p className="mt-4 text-muted-foreground leading-relaxed">
              {description}
            </p>

            {/* Feature list */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
              {features.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <span className="text-sm md:text-[15px]">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
