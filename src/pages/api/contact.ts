// src/pages/api/contact-send.ts
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export const config = { api: { bodyParser: true } };

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
const T = (v: any) => String(v ?? "").trim();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("PAGES ROUTE /api/contact-send (SMTP DEBUG)");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // 1) Validate input
    const { name = "", email = "", subject = "Website message", message = "", company = "" } = req.body || {};
    if (company) return res.status(200).json({ ok: true }); // honeypot
    if (!T(name) || !emailOk(email) || !T(message)) {
      return res.status(400).json({
        message: "Missing required fields",
        missing: { name: !T(name), email: !emailOk(email), message: !T(message) },
      });
    }

    // 2) Validate ENV
    const envReport = {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_SECURE: process.env.SMTP_SECURE,
      SMTP_USER: process.env.SMTP_USER ? "SET" : "MISSING",
      SMTP_PASS: process.env.SMTP_PASS ? "SET" : "MISSING",
    };
    const missingEnv = Object.entries(envReport)
      .filter(([, v]) => v === undefined || v === "MISSING")
      .map(([k]) => k);
    if (missingEnv.length) {
      console.error("ENV missing:", envReport);
      return res.status(500).json({ message: "SMTP env missing", envReport, missingEnv });
    }

    // 3) Create transporter with your env
    const secure = String(process.env.SMTP_SECURE ?? "true").toLowerCase() === "true"; // true->465, false->587 (STARTTLS)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT!),
      secure,
      auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    });

    // 4) Verify connection/creds
    try {
      await transporter.verify();
    } catch (e: any) {
      console.error("SMTP verify failed:", e);
      return res.status(500).json({
        message: "SMTP verify failed",
        code: e?.code,
        command: e?.command,
        response: e?.response,
        errno: e?.errno,
        syscall: e?.syscall,
        hint: secure
          ? "If this times out, try SMTP_PORT=587 and SMTP_SECURE=false"
          : "If 587 fails, try SMTP_PORT=465 and SMTP_SECURE=true",
      });
    }

    // 5) Build recipients list (supports CSV in CONTACT_TO), add envelope for clarity
    const toList = (process.env.CONTACT_TO || process.env.SMTP_USER!)!
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const brand = process.env.APP_BRAND || "XTremeTV";
    const safeSubject = `[Contact] ${String(subject).replace(/[\r\n]+/g, " ").slice(0, 200)}`;
    const html = `
      <h3>${brand} • Contact</h3>
      <p><b>Name:</b> ${escapeHtml(T(name))}</p>
      <p><b>Email:</b> ${escapeHtml(T(email))}</p>
      <hr/>
      <p style="white-space:pre-wrap">${escapeHtml(T(message))}</p>
    `;
    const text = `From: ${T(name)} <${T(email)}>\n\n${T(message)}`;

    // 6) Send
    try {
      const info = await transporter.sendMail({
        from: { name: brand, address: process.env.SMTP_USER! }, // must be your authenticated mailbox
        to: toList,
        replyTo: T(email),
        subject: safeSubject,
        text,
        html,
        envelope: { from: process.env.SMTP_USER!, to: toList }, // force RFC envelope
        headers: {
          "List-Unsubscribe": `<${(process.env.UNSUBSCRIBE_URL_BASE || "") + encodeURIComponent(email)}>`,
        },
      });

      // DIAGNOSTIC LOG
      console.log("SMTP SENT", {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        pending: info.pending,
        envelope: info.envelope,
        response: info.response,
      });

      return res.status(200).json({
        ok: true,
        messageId: info.messageId,
        accepted: info.accepted,
        response: info.response,
      });
    } catch (e: any) {
      console.error("SMTP send failed:", e);
      return res.status(500).json({
        message: "SMTP send failed",
        code: e?.code,
        response: e?.response,
        errno: e?.errno,
        syscall: e?.syscall,
        error: String(e?.message || e),
      });
    }
  } catch (e: any) {
    console.error("contact-send fatal error:", e);
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
}

function escapeHtml(s: string) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
