import cn from "clsx";

export function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "ok" | "warn" | "err";
}) {
  const ring =
    tone === "ok"
      ? "ring-emerald-400/20"
      : tone === "warn"
      ? "ring-amber-400/20"
      : tone === "err"
      ? "ring-rose-400/20"
      : "ring-white/10";
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/5 p-4 ring-1", ring)}>
      <div className="text-xs uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-1 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
