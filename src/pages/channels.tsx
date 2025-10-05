// pages/channels.tsx
import Head from "next/head";
import useSWR from "swr";
import ChannelsHero from "@/components/sections/ChannelsHero";
import ChannelsIntro from "@/components/sections/ChannelsIntro";
import ChannelCategories from "@/components/sections/ChannelCategories";
import ChannelsTable from "@/components/sections/ChannelsTable";
import type { Channel } from "@/components/sections/ChannelsTable";
import Navbar from "@/components/site/Navbar";
import XtrmFooter from "@/components/layout/XtrmFooter";

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function ChannelsPage() {
  const country = "US"; // change to "UK" if needed, or make it stateful
  const { data, error, isLoading } = useSWR(
    `/api/channels/list?provider=pluto&country=${country}&limit=200`,
    fetcher
  );

  const rows: Channel[] =
    (data?.items || []).map((c: any) => ({
      name: c.name,
      country: c.country || country,
      category: c.group || "General",
      quality: (c.name?.toLowerCase().includes("4k") ? "4K" :
                c.name?.toLowerCase().includes("uhd") ? "UHD" :
                "HD"),
      logo: c.logo,
      url: c.url,
    })) as Channel[];

  return (
    <>
      <Head>
        <title>Channels – XtrmIPTV</title>
        <meta name="description" content="Browse XtrmIPTV channel categories and search the full list of available channels." />
      </Head>

      <Navbar />
      <ChannelsHero />
      <ChannelsIntro />
      <ChannelCategories />

      {error ? (
        <div className="container mx-auto px-4 py-8 text-red-600">Failed to load channels.</div>
      ) : isLoading ? (
        <div className="container mx-auto px-4 py-8">Loading channels…</div>
      ) : (
        <ChannelsTable data={rows} />
      )}

      <XtrmFooter />
    </>
  );
}
