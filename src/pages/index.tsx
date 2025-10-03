import Head from "next/head";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import FeaturesRow from "@/components/site/FeaturesRow";

export default function Home() {
  return (
    <>
      <Head>
        <title>Xstream IPTV — The Best IPTV Subscription Provider</title>
        <meta name="description" content="Premium IPTV with Live TV, Movies, and EPG." />
      </Head>

      {/* Public navbar (your existing one is fine) */}
      <Navbar />

      {/* HERO */}
      <Hero />

      {/* FEATURES */}
      <div className="bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <FeaturesRow />
        </div>
      </div>
    </>
  );
}
