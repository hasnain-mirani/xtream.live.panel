import Link from "next/link";

const POSTER_WALL =
  // Use a collage/mosaic image you have, or keep this placeholder
  "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=2000&auto=format&fit=crop";

export default function Hero() {
  return (
    <section className="relative isolate bg-black">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 -z-10 bg-center bg-cover"
        style={{ backgroundImage: `url(${POSTER_WALL})` }}
      />
      {/* Dark overlay + vignette */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/80 to-black" />
      <div className="absolute inset-0 -z-10 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-white">
            Xtream IPTV The Best
            <br /> IPTV Subscription
            <br /> Provider
          </h1>
          <p className="mt-6 text-base md:text-lg text-white/80 max-w-2xl">
            Indulge in the ultimate Premium IPTV Service at incredibly low
            prices! Start now and gain access to Xtream IPTV, offering thousands
            of Live TV channels & VOD, without long-term contracts or
            commitments.
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/auth/register?trial=1"
              className="inline-flex rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3"
            >
              GET STARTED NOW
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-full ring-1 ring-white/20 hover:ring-white/40 text-white/90 hover:text-white font-semibold px-6 py-3"
            >
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
