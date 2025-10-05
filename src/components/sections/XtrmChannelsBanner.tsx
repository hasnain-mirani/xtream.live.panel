"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils"; // if you don't have cn, replace with string joins

type Props = {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  images?: string[]; // bg images for the collage/slider
  intervalMs?: number;
  className?: string;
};

const DEFAULT_IMAGES = [
  "/channels/jumanji.jpg",
  "/channels/messi.jpg",
  "/channels/peakblind.jpg",
  "/channels/cartoons.jpeg",
  "/channels/baseball.jpg",
];

export default function XtrmChannelsBanner({
  title = "Explore the Widest Range of Global Channels",
  subtitle = "Caliptostreams boasts unparalleled sports, news, and PPV streams with the highest quality in the market, all at an unbeatable price. Enjoy our sports events in crystal-clear 1080p HD at 60 fps.",
  ctaText = "View Channel List",
  ctaHref = "/channels",
  images = DEFAULT_IMAGES,
  intervalMs = 3500,
  className,
}: Props) {
  const [index, setIndex] = useState(0);

  // Auto-advance
  useEffect(() => {
    if (!images.length) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  // Parallax for overlay content
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -24]); // subtle lift on scroll

  // Dedup + stable keys
  const frames = useMemo(
    () => images.map((src, i) => ({ src, key: `${i}-${src}` })),
    [images]
  );

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        // Height like your screenshot; adjusts on breakpoints
        "h-[46vh] min-h-[320px] md:h-[54vh] lg:h-[64vh]",
        className
      )}
      aria-label="Channel categories highlight"
    >
      {/* Background slides */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          {frames.map((frame, i) =>
            i === index ? (
              <motion.div
                key={frame.key}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="absolute inset-0"
                aria-hidden
              >
                <div
                  className="absolute inset-0 bg-center bg-cover"
                  style={{ backgroundImage: `url(${frame.src})` }}
                />
                {/* Ken Burns slow drift (CSS transform) */}
                <div className="absolute inset-0 scale-110 animate-[kenburns_14s_linear_infinite]" />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Multi-stop gradient + vignette to ensure legible text */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
          <div className="absolute inset-0 ring-1 ring-black/20" />
        </div>
      </div>

      {/* Content */}
      <motion.div
        style={{ y }}
        className="relative z-10 h-full container mx-auto px-4 flex items-center justify-center text-center"
      >
        <div className="max-w-4xl">
          <h2 className="text-white text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            {title}
          </h2>
          <p className="mt-3 md:mt-4 text-sm sm:text-base md:text-lg text-white/85 leading-relaxed">
            {subtitle}
          </p>

          <div className="mt-6 md:mt-8 flex justify-center">
            <Link
              href={ctaHref}
              className={cn(
                "group inline-flex items-center justify-center rounded-full",
                "px-6 md:px-7 py-3 text-sm md:text-base font-semibold",
                "bg-primary text-primary-foreground shadow-lg",
                "transition-transform duration-200 hover:scale-[1.03] active:scale-95"
              )}
            >
              {ctaText}
              <span
                className="ml-2 inline-block h-2 w-2 rounded-full bg-white/80 group-hover:scale-125 transition-transform"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Small progress dots (optional) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 hidden md:flex gap-2">
        {frames.map((f, i) => (
          <button
            key={f.key}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 w-5 rounded-full transition-all",
              i === index ? "bg-white/90 w-7" : "bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Show background ${i + 1}`}
          />
        ))}
      </div>

      {/* Local CSS for Ken Burns (no global changes) */}
      <style jsx>{`
        @keyframes kenburns {
          0% {
            transform: translate3d(0px, 0px, 0) scale(1);
          }
          50% {
            transform: translate3d(0px, -2%, 0) scale(1.06);
          }
          100% {
            transform: translate3d(0px, 0px, 0) scale(1.12);
          }
        }
      `}</style>
    </section>
  );
}
