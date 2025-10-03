import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

export default function StatCard({
  title, value, hint, icon,
}: { title: string; value: string|number; hint?: string; icon?: ReactNode }) {
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
