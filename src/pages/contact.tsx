import Head from "next/head";
import ContactHero from "@/components/sections/ContactHero";
import ContactSection from "@/components/sections/ContactSection";
import Navbar from "@/components/site/Navbar";
import XtrmFooter from "@/components/layout/XtrmFooter";
import ContactMap from "@/components/sections/ContactMap";

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact – XtrmIPTV</title>
        <meta name="description" content="Get in touch with XtrmIPTV support and sales. We're available 24/7." />
      </Head>

    <Navbar />
      <ContactHero />
      <ContactSection />
       <ContactMap />
      <XtrmFooter/>
    </>
  );
}
