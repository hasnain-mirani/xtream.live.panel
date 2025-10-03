import { Tv, Film, CalendarDays } from "lucide-react";

function FeatureCard({
  title,
  desc,
  Icon,
}: {
  title: string;
  desc: string;
  Icon: any;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent p-6 hover:border-white/20 transition">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-white/70">{desc}</p>
    </div>
  );
}

export default function FeaturesRow() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <FeatureCard
        title="Live TV"
        desc="Access 18,000+ channels including sports, news and more across regions."
        Icon={Tv}
      />
      <FeatureCard
        title="Movies"
        desc="Explore 80,000+ movies and series in HD and UHD/4K for a seamless experience."
        Icon={Film}
      />
      <FeatureCard
        title="TV Guide (EPG)"
        desc="Integrated EPG with real-time programming listings across sources."
        Icon={CalendarDays}
      />
    </div>
  );
}
