import Head from "next/head";
import XtrmFAQ from "@/components/sections/XtrmFAQ";
import Navbar from "@/components/site/Navbar";
import XtrmFooter from "@/components/layout/XtrmFooter";

export default function FAQPage() {
  return (
    <>
      <Head>
        <title>FAQ – XtrmIPTV</title>
        <meta
          name="description"
          content="Frequently asked questions about XtrmIPTV: legality, devices, players, renewals, VPNs, and troubleshooting."
        />
      </Head>

<Navbar />
      {/* Optional hero to match your site */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[url('/images/posters-wall.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/65 to-black/80" />
        <div className="container mx-auto px-4 py-20 md:py-28 text-white">
          <p className="text-sm/6 opacity-80">Home › FAQ</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight">FAQ</h1>
        </div>
      </section>

      <XtrmFAQ />
      <XtrmFooter />
    </>
  );
}
