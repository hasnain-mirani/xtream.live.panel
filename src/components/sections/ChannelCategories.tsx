"use client";

import { motion } from "framer-motion";
import { Trophy, Film, Newspaper, Baby, Tv, Music } from "lucide-react";

type Cat = { icon: any; title: string; desc: string; href?: string };

const CATS: Cat[] = [
  { icon: Trophy,  title: "Sports Channels",        desc: "Live football, basketball, tennis, motorsports, and more." },
  { icon: Film,    title: "Movie Channels",         desc: "Hollywood blockbusters to timeless classics in crystal quality." },
  { icon: Newspaper, title: "News Channels",        desc: "Global & local 24/7 coverage and in-depth analysis." },
  { icon: Baby,    title: "Kids Channels",          desc: "Cartoons, educational shows, and family-friendly content." },
  { icon: Tv,      title: "Entertainment Channels", desc: "TV shows, reality, variety, and exclusive programs." },
  { icon: Music,   title: "Music Channels",         desc: "Pop, rock, jazz, classical, and more." },
];

export default function ChannelCategories() {
  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold text-primary/80 tracking-widest uppercase">Channels List</p>
          <h3 className="mt-2 text-2xl md:text-4xl font-extrabold">Our Channel Categories</h3>
          <p className="mt-3 text-muted-foreground">Clean, responsive layout with icons and succinct copy.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATS.map((c, i) => (
            <motion.a
              key={c.title}
              href={c.href || "#"}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              className="group rounded-2xl border bg-card p-6 ring-1 ring-black/5 shadow-sm hover:shadow-xl transition"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold text-primary group-hover:underline">{c.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
