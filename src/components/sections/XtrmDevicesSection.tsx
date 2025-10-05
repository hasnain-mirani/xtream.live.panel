"use client";

import Image, { StaticImageData } from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils"; // if you don't use cn, replace cn(...) with the string
import devicesImg from "@/assets/iptv.jpg";
type DeviceItem = { left: string; right: string };
type Props = {
  title?: string;
  blurb?: string;
  pairs?: DeviceItem[];
  imageSrc?: StaticImageData; 
  imageAlt?: string;
  className?: string;
};

const DEFAULT_PAIRS: DeviceItem[] = [
  { left: "Amazon Fire Stick / TV", right: "Apple Devices" },
  { left: "PC, Smartphones", right: "Mag Boxes, Stb Emu" },
  { left: "Android Devices, iOS", right: "Dreamlink, Formuler" },
  { left: "Samsung TV / LG", right: "Enigma & All IPTV Boxes" },
];

export default function XtrmDevicesSection({
  title = "Requirements Devices.",
  blurb = "Access our Xtream IPTV Subscription seamlessly on Android-based devices, whether on your mobile, box, laptop, or TV screen.",
  pairs = DEFAULT_PAIRS,
 
  imageAlt = "Supported devices: TV, tablet, phone, set-top boxes",
  className,
}: Props) {
  return (
    <section className={cn("py-14 md:py-20", className)}>
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 md:gap-14 lg:gap-20 md:grid-cols-2">
          {/* LEFT: text + list */}
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {title}
            </h2>

            <p className="mt-3 sm:mt-4 text-[15px] sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              {blurb}
            </p>

            {/* two-column list on md+, single column on mobile */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {pairs.map((row, i) => (
                <div key={i} className="flex flex-col gap-3">
                  {/* left line */}
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span className="text-sm sm:text-[15px]">{row.left}</span>
                  </div>
                  {/* right line (hidden on mobile; shown stacked below on small for readability) */}
                  <div className="flex items-start gap-3 md:hidden">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span className="text-sm sm:text-[15px]">{row.right}</span>
                  </div>
                </div>
              ))}

              {/* On md+, show the "right column" in its own column to mirror screenshot */}
              <div className="hidden md:flex md:flex-col md:gap-3">
                {pairs.map((row, i) => (
                  <div key={`r-${i}`} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span className="text-sm sm:text-[15px]">{row.right}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: image card */}
          <div className="relative">
            <div className="relative mx-auto max-w-[640px]">
              <div className="rounded-2xl border bg-card ring-1 ring-black/5 shadow-xl overflow-hidden">
                {/* Keep aspect ratio so it looks great on phones */}
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={devicesImg}
                    alt={imageAlt}
                    fill
                    className="object-contain md:object-cover bg-transparent"
                    priority
                    
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* tiny spacer for super small phones so nothing feels cramped */}
        <div className="mt-4 md:hidden" />
      </div>
    </section>
  );
}
