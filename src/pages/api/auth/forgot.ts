import type { NextApiRequest, NextApiResponse } from "next";
import { sendMail } from "@/lib/mailer"; // server file (OK here)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { to, subject, html, text } = req.body || {};
  if (!to || !subject || !html) return res.status(400).json({ error: "Missing fields" });

  try {
    await sendMail({ to, subject, html, text });
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("forgot email error:", e);
    return res.status(500).json({ error: e?.message || "Email failed" });
  }
}
