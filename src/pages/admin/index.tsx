import { useEffect, useState } from "react";
import AdminOnly from "@/components/AdminOnly";          // if you are not restricting, you can remove AdminOnly
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Activity, Tv, DollarSign } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

type Metrics = {
  headline: {
    users: number; activeSubs: number; trials: number; mrr: number; channels: number;
    activeSessions: number; progressCount: number;
  };
  charts: {
    signups: { day: string; count: number }[];
    watch: { day: string; count: number }[];
    topChannels: { channel: string; pings: number }[];
  };
};

function StatCard({ title, value, hint, icon }: { title: string; value: string | number; hint?: string; icon?: any }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <p className="text-xs opacity-70 mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then(async r => r.ok ? setData(await r.json()) : setErr("Failed to load metrics"))
      .catch(() => setErr("Failed to load metrics"));
  }, []);

  const page = (
    <AdminLayout>
      {!data && !err ? <LoadingSkeleton /> : null}
      {err ? <p className="text-red-600">{err}</p> : null}
      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Users" value={data.headline.users} hint="All time" icon={<Users className="w-4 h-4" />} />
            <StatCard title="Active Subs" value={data.headline.activeSubs} hint="Current" icon={<Activity className="w-4 h-4" />} />
            <StatCard title="Monthly Recurring" value={`$${data.headline.mrr}`} hint="Naive x9.99" icon={<DollarSign className="w-4 h-4" />} />
            <StatCard title="Channels" value={data.headline.channels} hint="Configured" icon={<Tv className="w-4 h-4" />} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="rounded-2xl">
              <CardHeader><CardTitle className="text-sm">Daily Signups (14d)</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.charts.signups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader><CardTitle className="text-sm">Daily Watch Pings (14d)</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.charts.watch}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader><CardTitle className="text-sm">Top Channels (24h)</CardTitle></CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.topChannels}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <StatCard title="Active Sessions" value={data.headline.activeSessions} hint="Device guard" />
            <StatCard title="Progress Rows" value={data.headline.progressCount} hint="Continue watching" />
            <StatCard title="Trials" value={data.headline.trials} hint="Free trial users" />
          </div>
        </div>
      )}
    </AdminLayout>
  );

  // If you are not restricting admin pages, you can return `page` directly.
  return (
    // <AdminOnly>{page}</AdminOnly>
    page
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    </div>
  );
}
