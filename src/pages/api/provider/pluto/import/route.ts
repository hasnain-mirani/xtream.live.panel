import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/db";
import Channel from "@/models/Channel";
import Program from "@/models/Program";
import { parseM3U } from "@/lib/playlist";
import { parseXMLTV } from "@/lib/xmltv";

const SECRET = process.env.IMPORT_SECRET!;
const REGIONS = [
  { code: "US", m3u: process.env.PLUTO_US_M3U, epg: process.env.PLUTO_US_EPG },
  { code: "UK", m3u: process.env.PLUTO_UK_M3U, epg: process.env.PLUTO_UK_EPG },
];

export async function POST(req: NextRequest) {
  const auth = req.nextUrl.searchParams.get("key");
  if (!SECRET || auth !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
    await connectDB();
  const result = { regions: [] as any[] };

  for (const r of REGIONS) {
    if (!r.m3u) continue;

    // 1) Import channels from M3U
    const { data: m3uText } = await axios.get<string>(r.m3u, { responseType: "text" });
    const chans = parseM3U(m3uText);

    let upserts = 0;
    for (const c of chans) {
      await Channel.updateOne(
        { provider: "pluto", tvgId: c.tvgId || undefined, name: c.name, country: r.code },
        {
          $set: {
            name: c.name,
            url: c.url,
            logo: c.logo,
            tvgId: c.tvgId,
            group: c.group,
            language: c.language,
            provider: "pluto",
            country: r.code,
          },
        },
        { upsert: true }
      );
      upserts++;
    }

    // 2) Import EPG (optional)
    let programs = 0;
    if (r.epg) {
      const { data: xml } = await axios.get<string>(r.epg, { responseType: "text" });
      const { programs: progs } = parseXMLTV(xml);

      // small cap to avoid huge writes on first run; remove cap later
      const batch = progs.slice(0, 5000);
      for (const p of batch) {
        if (!p.start || !p.stop || !p.channelTvgId) continue;
        await Program.updateOne(
          {
            provider: "pluto",
            country: r.code,
            channelTvgId: p.channelTvgId,
            start: p.start,
            stop: p.stop,
          },
          { $set: p },
          { upsert: true }
        );
      }
      programs = batch.length;
    }

    result.regions.push({ region: r.code, channels: upserts, programs });
  }

  return NextResponse.json(result);
}
