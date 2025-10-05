"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatar: string;    // e.g. "/avatars/amira-shah.jpg"
  rating?: number;   // 1..5
  quote: string;
};

type Props = {
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
  /** Slider auto-advance (ms) when marquee is false */
  autoMs?: number;
  /** Continuous marquee row if true */
  marquee?: boolean;
  /** Marquee speed in seconds for one loop (smaller = faster) */
  marqueeSeconds?: number;
  className?: string;
};

/** --------- Realistic names & comments (add matching images under public/avatars) ---------- */
const DEFAULT_ITEMS: Testimonial[] = [
  {
    id: "amira-shah",
    name: "Amira Shah",
    role: "Dubai, UAE",
    avatar: "/avatars/amira-shah.jpg",
    rating: 5,
    quote:
      "Signed up in minutes and it just works. Stable streams and sports channels are crystal clear on match days.",
  },
  {
    id: "dylan-owens",
    name: "Dylan Owens",
    role: "Manchester, UK",
    avatar: "/avatars/dylan-owens.jpg",
    rating: 5,
    quote:
      "Switched from cable and never looked back. The EPG and catch-up are spot on for my schedule.",
  },
  {
    id: "fatima-noor",
    name: "Fatima Noor",
    role: "Lahore, PK",
    avatar: "/avatars/fatima-noor.jpg",
    rating: 5,
    quote:
      "My parents can use it on the TV and I watch on my phone. Support helped me set up in under 5 minutes.",
  },
  {
    id: "leo-santana",
    name: "Leo Santana",
    role: "Lisbon, PT",
    avatar: "/avatars/leo-santana.jpg",
    rating: 5,
    quote:
      "Zero buffering during Champions League. Picture quality is consistently sharp, even on 4K.",
  },
  {
    id: "noor-al-ansari",
    name: "Noor Al-Ansari",
    role: "Doha, QA",
    avatar: "/avatars/noor-al-ansari.jpg",
    rating: 5,
    quote:
      "Great value for the channel list. Kids’ channels and movies library are updated constantly.",
  },
  {
    id: "jack-reynolds",
    name: "Jack Reynolds",
    role: "Sydney, AU",
    avatar: "/avatars/jack-reynolds.jpg",
    rating: 5,
    quote:
      "Works on my Fire TV and iPad without any fuss. Customer service replies fast on WhatsApp.",
  },
];

export default function XtrmTestimonialsSection({
  title = "What customers say",
  subtitle = "Real feedback from XtrmIPTV users worldwide",
  items = DEFAULT_ITEMS,
  autoMs = 4200,
  marquee = true,                // ← default to marquee as requested
  marqueeSeconds = 18,           // ← adjust speed
  className,
}: Props) {
  const [index, setIndex] = useState(0);
  const timer = useRef<NodeJS.Timeout | null>(null);

  // Duplicate for seamless loop (used by both slider & marquee)
  const slides = useMemo(() => [...items, ...items], [items]);

  const perView = useResponsivePerView(); // 1 / 2 / 3 cards depending on width

  // Auto-advance only for non-marquee slider
  useEffect(() => {
    if (marquee) return; // marquee animates via CSS keyframes
    clearTimer();
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, autoMs);
    return clearTimer;
  }, [items.length, autoMs, marquee]);

  function clearTimer() {
    if (timer.current) clearInterval(timer.current);
  }
  function prev() {
    clearTimer();
    setIndex((i) => (i - 1 + items.length) % items.length);
  }
  function next() {
    clearTimer();
    setIndex((i) => (i + 1) % items.length);
  }

  // translate percentage for slider (non-marquee)
  const offset = (100 / perView) * index;

  return (
    <section className={cn("relative py-16 md:py-24", className)}>
      {/* soft gradient bg */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/70 via-background to-background"
      />
      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <p className="text-xs font-semibold text-primary/80 tracking-widest uppercase">
            {subtitle}
          </p>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">
            {title}
          </h2>
        </motion.div>

        {/* Content */}
        {marquee ? (
          <MarqueeRow slides={slides} seconds={marqueeSeconds} />
        ) : (
          <SliderRow
            items={items}
            slides={slides}
            perView={perView}
            offset={offset}
            onPrev={prev}
            onNext={next}
            index={index}
            setIndex={setIndex}
          />
        )}
      </div>
    </section>
  );
}

/* ---------- Marquee (continuous) ---------- */
function MarqueeRow({ slides, seconds }: { slides: Testimonial[]; seconds: number }) {
  return (
    <div className="mt-10 group">
      <div className="overflow-hidden">
        <div
          className="flex gap-6 [animation:marquee_linear_infinite] group-hover:[animation-play-state:paused]"
          style={
            {
              // @ts-ignore – we inject dynamic duration via CSS var
              "--marquee-duration": `${seconds}s`,
            } as React.CSSProperties
          }
        >
          {slides.map((t, i) => (
            <Card key={`${t.id}-${i}`} t={t} basisPct={22} /> // ~4-5 items on desktop
          ))}
        </div>
      </div>

      {/* tiny helper for mobile touch spacing */}
      <div className="mt-6 md:hidden" />
    </div>
  );
}

/* ---------- Slider (arrows + dots) ---------- */
function SliderRow({
  items,
  slides,
  perView,
  offset,
  onPrev,
  onNext,
  index,
  setIndex,
}: {
  items: Testimonial[];
  slides: Testimonial[];
  perView: number;
  offset: number;
  onPrev: () => void;
  onNext: () => void;
  index: number;
  setIndex: (n: number) => void;
}) {
  return (
    <div className="relative mt-10">
      {/* arrows */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between">
        <button
          onClick={onPrev}
          className="pointer-events-auto ml-[-6px] md:ml-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur border shadow hover:scale-105 transition"
          aria-label="Previous"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={onNext}
          className="pointer-events-auto mr-[-6px] md:mr-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur border shadow hover:scale-105 transition"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6 will-change-transform"
          style={{
            width: `${(slides.length / perView) * 100}%`,
            translateX: `-${offset}%`,
          }}
          transition={{ type: "spring", stiffness: 120, damping: 24 }}
        >
          {slides.map((t, i) => (
            <Card key={`${t.id}-${i}`} t={t} basisPct={100 / (perView * 3)} />
          ))}
        </motion.div>
      </div>

      {/* dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 w-6 rounded-full transition-all",
              i === index ? "bg-foreground w-7" : "bg-muted-foreground/30 hover:bg-muted-foreground/60"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Card ---------- */
function Card({ t, basisPct }: { t: Testimonial; basisPct: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      whileHover={{ y: -4 }}
      className="relative"
      style={{ flex: `0 0 ${basisPct}%` }}
    >
      <div className="h-full rounded-2xl border bg-card/80 backdrop-blur-sm ring-1 ring-black/5 shadow-sm hover:shadow-xl transition-all p-6 md:p-7">
        {/* rating */}
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
        </div>

        {/* quote */}
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          <Quote className="inline h-4 w-4 mr-1 -mt-1 opacity-60" />
          <span className="italic">{t.quote}</span>
        </p>

        {/* person */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-black/10">
            <Image src={t.avatar} alt={t.name} fill className="object-cover" />
          </div>
          <div>
            <div className="text-sm font-semibold">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.role}</div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

/* ---------- Responsive per view ---------- */
function useResponsivePerView() {
  const [pv, setPv] = useState(1);
  useEffect(() => {
    const calc = () => {
      if (window.innerWidth >= 1024) setPv(3);
      else if (window.innerWidth >= 640) setPv(2);
      else setPv(1);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return pv;
}

/* ---------- Marquee keyframes (Tailwind-friendly) ----------
   Add this once to your global CSS if you don't already have it:
  
---------------------------------------------------------------- */
