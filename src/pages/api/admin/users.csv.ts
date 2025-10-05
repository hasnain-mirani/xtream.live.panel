import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import  User  from "@/models/User";
import { Subscription } from "@/models/Subscription";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();
  const filter: any = { role: "user" };
  const q = String(req.query.q || "").trim();
  if (q) filter.$or = [{ email: { $regex: q, $options: "i" } }, { name: { $regex: q, $options: "i" } }];
  const users = await User.find(filter).select("name email active verified createdAt").lean();
  const ids = users.map((u:any)=>String(u._id));
  const subs = await Subscription.find({ userId: { $in: ids } }).select("userId status trialEndsAt currentPeriodEnd planMonths").lean();
  const map = new Map(subs.map((s:any)=>[String(s.userId), s]));

  const rows = [
    ["name","email","active","verified","status","planMonths","trialEndsAt","currentPeriodEnd","createdAt"],
    ...users.map((u:any)=>{
      const s = map.get(String(u._id)) || {};
      return [
        u.name||"", u.email, u.active!==false, !!u.verified,
        s.status||"", s.planMonths||"", s.trialEndsAt||"", s.currentPeriodEnd||"", u.createdAt?.toISOString()||""
      ].join(",");
    })
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=users.csv");
  res.status(200).send(rows);
}
