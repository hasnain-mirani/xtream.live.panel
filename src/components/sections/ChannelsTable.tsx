"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Channel = { name: string; country: string; category: string; quality: "4K"|"FHD"|"HD"|"SD" };
type Props = { data: Channel[] };

export default function ChannelsTable({ data }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const cats = useMemo(() => ["All", ...Array.from(new Set(data.map(d => d.category)))], [data]);

  const rows = data.filter((d) => {
    const matchesQ = [d.name, d.country, d.category].some(x => x.toLowerCase().includes(q.toLowerCase()));
    const matchesCat = cat === "All" || d.category === cat;
    return matchesQ && matchesCat;
  });

  return (
    <section className="py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <input
            placeholder="Search channel or country…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            className="w-full md:max-w-sm rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <select
            value={cat}
            onChange={(e)=>setCat(e.target.value)}
            className="w-full md:w-40 rounded-xl border bg-background px-3 py-2 text-sm"
          >
            {cats.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="text-xs text-muted-foreground md:ml-auto">{rows.length} results</div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="[&>th]:px-4 [&>th]:py-3 text-left">
                <th>Channel</th>
                <th>Country</th>
                <th>Category</th>
                <th>Quality</th>
              </tr>
            </thead>
            <tbody className="[&>tr]:border-t">
              {rows.map((r, i) => (
                <tr key={`${r.name}-${i}`} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.country}</td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className={cn("px-4 py-3 font-semibold",
                    r.quality==="4K" ? "text-emerald-600" :
                    r.quality==="FHD" ? "text-blue-600" :
                    r.quality==="HD" ? "text-indigo-600" : "text-muted-foreground"
                  )}>
                    {r.quality}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Tip: type “sports” or “USA” to narrow down quickly. Data here is sample; wire it to your real dataset or API.
        </p>
      </div>
    </section>
  );
}
