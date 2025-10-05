"use client";

import Image from "next/image";
import firestick1 from "@/assets/ibo/1.png";
import firestick2 from "@/assets/ibo/2.png";
import firestick3 from "@/assets/ibo/3.png";
import firestick4 from "@/assets/ibo/4.png";
import firestick5 from "@/assets/ibo/5.png";

const STEPS = [
  { n: 1, text: "From the Fire Stick Home screen, select the Search icon.", img: firestick1 },
  { n: 2, text: "Type 'Downloader' and install the Downloader app.",       img: firestick2 },
  { n: 3, text: "Open Downloader and enter: https://iboiptv.com/app",       img: firestick3 },
  { n: 4, text: "Download the APK and, when finished, click Install.",       img: firestick4 },
  { n: 5, text: "Open IBO Player. Note the Device ID & Key.",               img: firestick5 },

];

export default function InstallLongForm() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h3 className="text-xl md:text-2xl font-extrabold">IBO Player Installation on Amazon Fire Stick (Detailed)</h3>
        <div className="mt-6 space-y-8">
          {STEPS.map(s => (
            <div key={s.n} className="grid gap-4 md:grid-cols-2 items-start">
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="relative aspect-[16/9] w-full">
                  <Image src={s.img} alt={`Step ${s.n}`} fill className="object-cover" />
                </div>
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-primary/80 uppercase">Step {s.n}</div>
                <p className="mt-2 text-sm md:text-base text-muted-foreground">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
