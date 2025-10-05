import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Channel from "@/models/Channel";

export async function GET(req: NextRequest) {
    await connectDB();
  const { searchParams } = req.nextUrl;

  const q = (searchParams.get("q") || "").trim();
  const country = searchParams.get("country") || undefined; // "US" | "UK"
  const provider = searchParams.get("provider") || "pluto";
  const page = Number(searchParams.get("page") || "1");
  const limit = Math.min(60, Number(searchParams.get("limit") || "30"));

  const filter: any = { provider };
  if (country) filter.country = country;
  if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Channel.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Channel.countDocuments(filter),
  ]);

  return NextResponse.json({ items, total, page, limit });
}
