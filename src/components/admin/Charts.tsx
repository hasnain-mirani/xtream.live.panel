import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function LineChartCard({ title, data, xKey, yKey }:{
  title: string; data: any[]; xKey: string; yKey: string;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={yKey} strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function BarChartCard({ title, data, xKey, yKey }:{
  title: string; data: any[]; xKey: string; yKey: string;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={yKey} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PieChartCard({ title, data, nameKey, valueKey }:{
  title: string; data: any[]; nameKey: string; valueKey: string;
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} nameKey={nameKey} dataKey={valueKey} outerRadius={90} label>
              {data.map((_, i) => <Cell key={i} />)}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
