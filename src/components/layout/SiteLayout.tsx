"use client";

import type { PropsWithChildren } from "react";
import Navbar from "@/components/site/Navbar";
import XtrmFooter from "@/components/layout/XtrmFooter";

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b0f1f,35%,#0f1220)] text-white/90">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
        <XtrmFooter />
    </div>
  );
}
