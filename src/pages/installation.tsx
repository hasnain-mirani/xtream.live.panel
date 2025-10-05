import Head from "next/head";
import InstallHero from "@/components/sections/InstallHero";
import InstallTabs from "@/components/sections/InstallTabs";
import InstallLongForm from "@/components/sections/InstallLongForm";
import Navbar from "@/components/site/Navbar";
import XtrmFooter from "@/components/layout/XtrmFooter";

export default function InstallationPage() {
  return (
    <>
      <Head>
        <title>Installation – XtrmIPTV</title>
        <meta name="description" content="Install XtrmIPTV on Fire Stick, Android, Apple, Smart TV, MAG, Enigma2, PC/Mac. Step-by-step guide." />
      </Head>
<Navbar />
      <InstallHero />
      <InstallTabs />
      {/* Keep or remove the long Fire Stick tutorial: */}
      <InstallLongForm />
      <XtrmFooter/>
    </>
  );
}
