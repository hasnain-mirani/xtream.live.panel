import Head from "next/head";
import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import FeaturesRow from "@/components/site/FeaturesRow";
import XtrmFeatureSection from "@/components/sections/XtrmFeatureSection";
import XtrmDevicesSection from "@/components/sections/XtrmDevicesSection";
import XtrmChannelsBanner from "@/components/sections/XtrmChannelsBanner";
import XtrmPricingSection from "@/components/sections/XtrmPricingSection";
import XtrmTestimonialsSection from "@/components/sections/XtrmTestimonialsSection";
import XtrmFooter from "@/components/layout/XtrmFooter";
export default function Home() {
  return (
    <>
      <Head>
        <title>Xstream IPTV — The Best IPTV Subscription Provider</title>
        <meta
          name="description"
          content="Premium IPTV with Live TV, Movies, and EPG."
        />
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
        {/* XtrmFeatureSection */}
        <XtrmFeatureSection
          imageSrc="/images/hero/netflix-tv.jpg" // put your screenshot-like image here
        />
      </div>

      {/* …previous sections… */}
      <XtrmChannelsBanner
        images={[
          "/channels/jumanji.jpg",
          "/channels/messi.jpg",
          "/channels/crime.jpg",
          "/channels/cartoons.jpg",
          "/channels/baseball.jpg",
        ]}
        ctaHref="/channels"
        ctaText="View Channel List"
      />
      {/* …next sections… */}
     {/* devices Section */}
      <XtrmDevicesSection
        imageSrc="/assets/devices.png" // your path
      />
      {/* pricing  sections… */}
        <XtrmPricingSection />
 {/* …other sections… */}
      <XtrmTestimonialsSection
        items={[
          // plug your real avatars & quotes here
          {
            id: "1",
            name: "Leslie Alexander",
            role: "Happy Customer",
            avatar: "/avatars/leslie.jpg",
            rating: 5,
            quote:
              "Instant setup and excellent channel quality. It just works.",
          },
          {
            id: "2",
            name: "Jacob Jones",
            role: "Happy Customer",
            avatar: "/avatars/jacob.jpg",
            rating: 5,
            quote:
              "The best IPTV I’ve used. Smooth 60fps sports and reliable catchup.",
          },
          {
            id: "3",
            name: "Jenny Wilson",
            role: "Happy Customer",
            avatar: "/avatars/jenny.jpg",
            rating: 5,
            quote:
              "Great value and super helpful support. Highly recommended!",
          },
        ]}
             />
      {/* footer (your existing one is fine) */}
      <XtrmFooter />
             

    </>
  );
}
