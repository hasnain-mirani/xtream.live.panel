"use client";

import { motion } from "framer-motion";
import postersWall from "@/assets/channels/hero.jpg";
export default function ChannelsHero() {
  return (
    <section className="relative isolate overflow-hidden">
  <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${postersWall.src})` }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/65 to-black/80" />
      <div className="container mx-auto px-4 py-20 md:py-28 text-white">
        <motion.p initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-sm/6 opacity-80">
          Home › Channel List
        </motion.p>
        <motion.h1 initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight">
          Channel List
        </motion.h1>
        <motion.p initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-4 text-white/85 max-w-3xl">
          22,000+ live channels and 120,000+ VODs in 4K/Full HD/SD. Stable, buffer-free streaming on every device.
        </motion.p>
      </div>
    </section>
  );
}
