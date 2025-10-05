"use client";
import { motion } from "framer-motion";

export default function ContactHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[url('/images/posters-wall.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/65 to-black/80" />
      <div className="container mx-auto px-4 py-20 md:py-28 text-white">
        <motion.p initial={{opacity:0,y:8}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-sm/6 opacity-80">Home › Contact</motion.p>
        <motion.h1 initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight">Contact</motion.h1>
      </div>
    </section>
  );
}
