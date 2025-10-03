import Protected from "@/components/Protected";
import TrialCountdown from "@/components/TrialCountdown";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Clock, Crown } from "lucide-react";
import Navbar from "@/components/site/Navbar";

type CW = { channelKey: string; playhead: number; updatedAt: string };
type Sub = { status: string; trialEndsAt?: string | null; currentPeriodEnd?: string | null };

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [sub, setSub] = useState<Sub | null>(null);
  const [cw, setCw] = useState<CW[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    setErr(null);
    try {
      const t = Date.now();
      const [meR, subR, cwR] = await Promise.all([
        fetch(`/api/auth/me?t=${t}`, { cache: "no-store" }),
        fetch(`/api/subscription/me?t=${t}`, { cache: "no-store" }),
        fetch(`/api/user/continue?t=${t}`, { cache: "no-store" }),
      ]);

      if (meR.status === 401) { setMe(null); } else if (meR.ok) { setMe((await meR.json()).user); }

      if (subR.ok) setSub(await subR.json());
      else setSub(null);

      if (cwR.ok) {
        const j = await cwR.json().catch(() => ({}));
        setCw(j.items || []);
      } else setCw([]);
    } catch (e: any) {
      setErr("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const startTrial = async () => {
    setMsg(null);
    setErr(null);
    try {
      const r = await fetch("/api/trial/start", { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        // Common backend responses: { message: "Trial already used" } or similar
        setErr(j.message || "Could not start trial.");
        return;
      }
      setMsg("Trial started!");
      // Some backends return the new sub in the body; still refetch to be safe
      await loadAll();
    } catch {
      setErr("Could not start trial.");
    }
  };

  const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  const statusBadge = useMemo(() => {
    const s = sub?.status || "none";
    if (s === "active") return <Badge className="bg-emerald-600">Active</Badge>;
    if (s === "trial") return <Badge className="bg-amber-600">Trial</Badge>;
    if (s === "canceled") return <Badge variant="outline">Canceled</Badge>;
    return <Badge variant="outline">None</Badge>;
  }, [sub?.status]);

  // Enable trial only if user has no active plan and is not already on trial
  const canStartTrial = !sub || sub.status === "none";

  return (
    <Protected>
      <Navbar />
      <main className="bg-black text-white min-h-screen">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Dashboard</h1>
              {me && (
                <p className="text-white/70 mt-1">
                  Welcome, <span className="font-semibold">{me.name}</span>{" "}
                  <span className="opacity-70">({me.email})</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link href="/watch">
                <Button className="rounded-2xl">
                  <Play className="w-4 h-4 mr-2" /> Watch Now
                </Button>
              </Link>
              <Link href="/upgrade">
                <Button variant="outline" className="rounded-2xl">
                  <Crown className="w-4 h-4 mr-2" /> Upgrade
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl border-white/10 bg-white/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white/80">Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-white/70">Status:</span> {statusBadge}
                </div>

                {sub?.status === "trial" && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className="text-white/70">Trial left:</span>
                    <TrialCountdown trialEndsAt={sub.trialEndsAt || undefined} />
                  </div>
                )}

                {(!sub || sub.status === "none") && (
                  <Alert className="bg-white/[0.03] border-white/10 text-white">
                    <AlertDescription>
                      You don’t have an active plan. Start a free 48h trial or upgrade any time.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={startTrial}
                    className="rounded-2xl"
                    variant="secondary"
                    disabled={!canStartTrial}
                    title={!canStartTrial ? "Trial unavailable while Trial/Active" : "Start Free Trial"}
                  >
                    Start Free Trial
                  </Button>
                  <Link href="/upgrade">
                    <Button className="rounded-2xl" variant="outline">
                      View Plans
                    </Button>
                  </Link>
                </div>

                {msg && <p className="text-emerald-400 text-sm">{msg}</p>}
                {err && <p className="text-red-400 text-sm">{err}</p>}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-white/10 bg-white/[0.02]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white/80">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm text-white/80">
                <p>• Open the Watch page and try a channel.</p>
                <p>• Your last position is saved for “Continue Watching”.</p>
                <p>• Upgrade to unlock full channel list and VOD.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-white/10 bg-white/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white/80">Continue Watching</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="opacity-70 text-sm">Loading…</p>
              ) : cw.length === 0 ? (
                <p className="opacity-70 text-sm">No recent progress yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cw.map((i, n) => (
                    <Link
                      key={n}
                      href={`/watch#${i.channelKey}`}
                      className="block rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/20 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{i.channelKey}</div>
                        <Badge variant="outline">{fmt(i.playhead)}</Badge>
                      </div>
                      <div className="text-xs text-white/60 mt-2">
                        Updated {new Date(i.updatedAt).toLocaleString()}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </Protected>
  );
}
