import Head from "next/head";
import XtrmPricingSection from "@/components/sections/XtrmPricingSection"; // <- from earlier message
import Navbar from "@/components/site/Navbar";
import XtrmFooter from "@/components/layout/XtrmFooter";

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>XtrmIPTV – Pricing Plans</title>
        <meta name="description" content="Choose monthly, quarterly, semi-annual or annual IPTV plans. Instant activation, EPG, catchup, 24/7 support." />
      </Head>

    
<Navbar />
      <XtrmPricingSection
        title="Affordable Pricing for XtrmIPTV"
        subtitle="Pick a plan that fits. Start with a 7-day trial and upgrade anytime."
        plans={[
          {
            id: "1m",
            name: "1 Month",
            cadence: "1 Month",
            price: "$15.99",
            cta: "Order Now",
            href: "/checkout?plan=1m",
            features: [
              "Instant Activation",
              "22,000+ Live Channels",
              "Full HD + UHD",
              "+1 Connection included",
              "Catchup Allowed",
              "24/7 Support",
              "Including EPG",
            ],
          },
          {
            id: "3m",
            name: "3 Months",
            cadence: "3 Months",
            price: "$32.99",
            cta: "Order Now",
            href: "/checkout?plan=3m",
            features: [
              "Instant Activation",
              "22,000+ Live Channels",
              "Full HD + UHD",
              "+1 Connection included",
              "Catchup Allowed",
              "24/7 Support",
              "Including EPG",
            ],
          },
          {
            id: "12m",
            name: "12 Months",
            cadence: "12 Months",
            price: "$69.99",
            cta: "Order Now",
            href: "/checkout?plan=12m",
            popular: true,
            features: [
              "Instant Activation",
              "22,000+ Live Channels",
              "Full HD + UHD",
              "+1 Connection included",
              "Catchup Allowed",
              "24/7 Support",
              "Including EPG",
            ],
          },
          {
            id: "6m",
            name: "6 Months",
            cadence: "6 Months",
            price: "$54.99",
            cta: "Order Now",
            href: "/checkout?plan=6m",
            features: [
              "Instant Activation",
              "22,000+ Live Channels",
              "Full HD + UHD",
              "+1 Connection included",
              "Catchup Allowed",
              "24/7 Support",
              "Including EPG",
            ],
          },
        ]}
      />

      {/* Optional: add a small FAQ under pricing */}
      <section className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <h3 className="text-xl md:text-2xl font-bold">FAQs</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You can change or cancel anytime. Activation is instant after payment.
          </p>
        </div>
      </section>
       <XtrmFooter />
    </>
  );
}
