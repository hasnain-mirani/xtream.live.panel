import type { NextApiRequest, NextApiResponse } from "next";
import { verifySmtp } from "@/lib/mailer";
import { emailWelcome } from "@/server/emailService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await verifySmtp();
    const to = String(req.query.to || "");
    if (!to) return res.status(400).json({ message: "Provide ?to=email@example.com" });

    await emailWelcome(to, "Hasnain", new Date(Date.now() + 48*60*60*1000));
    return res.json({ ok: true });
  } catch (e: any) {
    console.error("email test error:", e?.message || e);
    return res.status(500).json({ message: e?.message || "Mail error" });
  }
}
