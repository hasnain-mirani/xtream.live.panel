"use client";
import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tv2, Smartphone, Laptop, Apple, TabletSmartphone, MonitorSmartphone } from "lucide-react";

import { cn } from "@/lib/utils"; // if you don't have cn, replace cn(...) with string joins
import fs1 from "@/assets/ibo/1.png";
import fs2 from "@/assets/ibo/2.png";
import fs3 from "@/assets/ibo/3.png";
import fs4 from "@/assets/ibo/4.png";
import fs5 from "@/assets/ibo/5.png";
const STEP_IMAGES: StaticImageData[] = [fs1, fs2, fs3, fs4, fs5];
type Step = {
  title: string;
  text: string;
  img?: StaticImageData;
};

type DeviceGuide = { key: string; label: string; icon: React.ElementType; steps: Step[]; };

const GUIDES: DeviceGuide[] = [
  {
    key: "firestick",
    label: "Amazon Fire Stick",
    icon: Tv2,
    steps: [
      { title: "Open Search",         text: "From Fire TV Home, select the Search icon.",                                img: fs1 },
  { title: "Install Downloader",  text: "Search for 'Downloader' and install it.",                                   img: fs2 },
  { title: "Open Downloader",     text: "Launch Downloader and enter: https://iboiptv.com/app",                      img: fs3 },
  { title: "Install IBO Player",  text: "Download the APK, then click Install.",                                     img: fs4 },
  { title: "Open IBO Player",     text: "Note the Device ID & Key shown on screen.",                                 img: fs5 },
      { title: "Activate", text: "Visit ibo.pro/app to activate using Device ID & Key (or contact support)." },
      { title: "Enter Playlist", text: "Add the M3U/portal details we emailed to you and start streaming!" },
    ],
  },
  {
    key: "pcmac",
    label: "PC / Mac",
    icon: Laptop,
    steps: [
      { title: "Get a Player", text: "Install VLC or OTT Navigator (Windows), IINA (macOS), or any IPTV player." },
      { title: "Add Playlist", text: "Open the player and add your M3U URL (from email). For EPG, add the XML URL." },
      { title: "Start Watching", text: "Save, refresh channels, and enjoy live TV & VOD." },
    ],
  },
  {
    key: "apple",
    label: "Apple Devices",
    icon: Apple,
    steps: [
      { title: "Install a Player", text: "On Apple TV/iOS install IBO Player, IPTV Smarters, or rIPTV." },
      { title: "Activate (if needed)", text: "Some players require device activation on their site." },
      { title: "Enter Details", text: "Paste M3U / portal credentials from your welcome email." },
    ],
  },
  {
    key: "android",
    label: "Android Devices",
    icon: Smartphone,
    steps: [
      { title: "Install a Player", text: "Install IPTV Smarters, IBO Player, or OTT Navigator from Play Store." },
      { title: "Login/Upload", text: "Use M3U link or Xtream Codes portal (URL/Username/Password)." },
      { title: "Enjoy", text: "Load channels, enable EPG & Catchup in player settings." },
    ],
  },
  {
    key: "androidtv",
    label: "Android TV",
    icon: MonitorSmartphone,
    steps: [
      { title: "Open Play Store", text: "Install IBO Player or OTT Navigator." },
      { title: "Enter Credentials", text: "Add playlist/portal from your email." },
      { title: "Done", text: "Refresh and start watching in 4K/FHD where available." },
    ],
  },
  {
    key: "smarttv",
    label: "Smart TV / MAG / Enigma2",
    icon: TabletSmartphone,
    steps: [
      { title: "Install Compatible App", text: "On Samsung/LG use IBO Player or Smart IPTV (where available)." },
      { title: "MAC Activation", text: "For MAG/Enigma2, add portal URL & provide MAC address if required." },
      { title: "Sync & Watch", text: "Reboot device/app to sync the playlist and EPG." },
    ],
  },
];

export default function InstallTabs() {
  const [active, setActive] = useState<DeviceGuide["key"]>("firestick");
  const guide = GUIDES.find(g => g.key === active)!;

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        {/* Two-step intro */}
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold">How to Setup XtrmIPTV on All Devices</h2>
            <div className="mt-5 space-y-4 text-muted-foreground">
              <p><span className="font-semibold text-foreground">Step 1:</span> Find your IPTV server details in the welcome email (check Spam too).</p>
              <p><span className="font-semibold text-foreground">Step 2:</span> Select your device below and follow the exact steps to install a player & add your playlist.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {GUIDES.map(g => (
              <button
                key={g.key}
                onClick={() => setActive(g.key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  g.key === active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted"
                )}
              >
                <g.icon className="h-4 w-4" />
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <motion.div
          key={guide.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {guide.steps.map((s, i) => (
            <div
              key={`${guide.key}-${i}`}
              className="rounded-2xl border bg-card ring-1 ring-black/5 shadow-sm overflow-hidden"
            >
              {s.img && (
                <div className="relative aspect-[16/9] w-full">
                  <Image src={s.img} alt={s.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="text-xs font-bold tracking-widest text-primary/80 uppercase">
                  Step {i + 1}
                </div>
                <h3 className="mt-1 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Help strip */}
        <div className="mt-10 rounded-2xl border bg-muted/50 p-5 text-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <div>Need help with activation or choosing a player?</div>
          <div className="flex gap-2">
            <a href="/contact" className="rounded-full border px-4 py-2 hover:bg-background">Contact Support</a>
            <a href="/trial" className="rounded-full bg-primary text-primary-foreground px-4 py-2 font-semibold">Start Free Trial</a>
          </div>
        </div>
      </div>
    </section>
  );
}
