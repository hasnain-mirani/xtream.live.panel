import Head from "next/head";
import AboutHero from "@/components/sections/AboutHero";
import WhyChoose from "@/components/sections/WhyChoose";
import Equipment from "@/components/sections/Equipment";
import StatsStrip from "@/components/sections/StatsStrip";
import HowItWorks from "@/components/sections/HowItWorks";
import Navbar from "@/components/site/Navbar";
import XtrmFooter from "@/components/layout/XtrmFooter";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About – XtrmIPTV</title>
        <meta name="description" content="Learn about XtrmIPTV — premium IPTV on every device with instant activation, 24/7 support and stunning quality." />
      </Head>
<Navbar />

    
      <AboutHero />
      <WhyChoose />
      <Equipment />
      <StatsStrip />
      <HowItWorks />

      <XtrmFooter />
    </>
  );
}
