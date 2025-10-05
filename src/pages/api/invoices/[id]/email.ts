// src/pages/api/invoices/[id]/email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import { mailer } from "@/lib/mailer"; // ✅ your transport factory
import { BANK as FALLBACK_BANK, PAYMENT_NOTE, esc } from "@/lib/billing";

/* ---------- tiny utils ---------- */
function getIdParam(req: NextApiRequest) {
  const raw = req.query.id;
  return Array.isArray(raw) ? raw[0] : raw || "";
}
const T = (v: any) => String(v ?? "").trim();
const money = (n: number, c = "EUR") => {
  try { return new Intl.NumberFormat("en-US",{style:"currency",currency:c}).format(n); }
  catch { return `${n.toFixed(2)} ${c}`; }
};

type LeanUser = { _id?: any; email?: string; name?: string } | null;
type LeanInvoice = {
  _id: any;
  userId?: any;
  invoiceNo?: string;
  number?: string;
  status?: string;
  currency?: string;
  amount?: number;
  dueDate?: string | Date;
  items?: Array<{desc?: string; qty?: number; unit?: number; total?: number}>;
  business?: { name?: string; address?: string; email?: string };
  bank?: {
    name?: string; accountName?: string; accountNo?: string;
    sortCode?: string; iban?: string; swift?: string; currency?: string;
  };
} | null;

/* ---------- handler ---------- */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const id = getIdParam(req);
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid invoice id" });
  }

  try {
    await connectDB();

    const inv = (await Invoice.findById(id).lean()) as LeanInvoice;
    if (!inv) return res.status(404).json({ message: "Invoice not found" });

    // Resolve user
    const userId = inv.userId ? String(inv.userId) : "";
    const user = (await User.findById(userId).lean()) as LeanUser;
    if (!user?.email) return res.status(400).json({ message: "User email missing" });

    // Values & fallbacks
    const host = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const invoiceUrl = `${host}/invoice/${id}`;

    const invNo = T(inv.invoiceNo || inv.number || id);
    const currency = T(inv.currency || FALLBACK_BANK.currency || "EUR");
    const amount = Number(inv.amount ?? 0);
    const due = inv.dueDate ? new Date(inv.dueDate) : new Date();
    const status = T(inv.status || "PENDING").toUpperCase();

    const businessName = T(inv.business?.name || process.env.APP_BRAND || "XTremeTV");

    // Prefer invoice-embedded bank block, else fallback to your Wise details
    const BANK = {
      name: T(inv.bank?.name || FALLBACK_BANK.bankName),
      accountName: T(inv.bank?.accountName || FALLBACK_BANK.accountHolder),
      accountNo: T(inv.bank?.accountNo || ""),
      sortCode: T(inv.bank?.sortCode || ""),
      iban: T(inv.bank?.iban || FALLBACK_BANK.iban),
      swift: T(inv.bank?.swift || FALLBACK_BANK.swift),
      currency: T(inv.bank?.currency || FALLBACK_BANK.currency),
      canReceive: T(FALLBACK_BANK.canReceive),
      address: T(FALLBACK_BANK.bankAddress),
    };

    // HTML body
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial; color:#111">
        <h2 style="margin:0 0 8px">Invoice ${esc(invNo)} — ${esc(status)}</h2>
        <p style="margin:0 0 10px">Hi ${esc(user.name || "")},</p>
        <p style="margin:0 0 10px">Thanks for choosing ${esc(businessName)}.</p>
        <p style="margin:0 0 10px">
       
          <b>Due date:</b> ${esc(due.toISOString().slice(0,10))}
        </p>

        <p style="margin:0 0 12px">Please pay by bank transfer and include <b>${esc(invNo)}</b> in the payment reference.</p>
        <p style="margin:0 0 14px">
          <a href="${esc(invoiceUrl)}" style="display:inline-block;background:#0b0f1f;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700" target="_blank" rel="noreferrer">
            View / Print invoice
          </a>
        </p>

        <h3 style="margin:0 0 8px">💳 Bank Payment Details</h3>
        <div style="margin:0 0 12px">
          <div><b>Account Holder:</b> ${esc(BANK.accountName)}</div>
          <div><b>Bank Name:</b> ${esc(BANK.name)}</div>
          <div><b>Bank Address:</b> ${esc(BANK.address)}</div>
          <div><b>IBAN:</b> ${esc(BANK.iban)}</div>
          <div><b>SWIFT/BIC:</b> ${esc(BANK.swift)}</div>
          ${BANK.accountNo ? `<div><b>Account No:</b> ${esc(BANK.accountNo)}</div>` : ""}
          ${BANK.sortCode  ? `<div><b>Sort Code:</b> ${esc(BANK.sortCode)}</div>` : ""}
          <div><b>Currency:</b> ${esc(BANK.currency)}</div>
          <div><b>Can Receive From:</b> ${esc(BANK.canReceive)}</div>
        </div>

        <div style="white-space:pre-line;background:#f6f7fb;border:1px solid #e5e7f1;border-radius:8px;padding:10px">
${esc(PAYMENT_NOTE)}
        </div>

        <p style="margin:10px 0 0;font-size:12px;color:#666">
          Use reference: <b>${esc(invNo)}</b>
        </p>
      </div>
    `;

    // Plain text
    const text =
`Invoice ${invNo} — ${status}
Hi ${user.name || ""}


Due date: ${due.toISOString().slice(0,10)}

Pay by bank transfer and include: ${invNo}

View / Print: ${invoiceUrl}

Bank Payment Details
Account Holder: ${BANK.accountName}
Bank Name: ${BANK.name}
Bank Address: ${BANK.address}
IBAN: ${BANK.iban}
SWIFT/BIC: ${BANK.swift}
${BANK.accountNo ? `Account No: ${BANK.accountNo}\n` : ""}${BANK.sortCode ? `Sort Code: ${BANK.sortCode}\n` : ""}Currency: ${BANK.currency}
Can Receive From: ${BANK.canReceive}

${PAYMENT_NOTE}

Reference: ${invNo}
`;

    const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER || "support@xtremetv.live";
    const unsubscribeBase = process.env.UNSUBSCRIBE_URL_BASE || `${host}/unsubscribe?email=`;

    const tx = mailer();
    const info = await tx.sendMail({
      from: fromAddr,
      to: user.email!,
      subject: `Invoice ${invNo} — ${status}`,
      html,
      text,
      headers: { "List-Unsubscribe": `<${unsubscribeBase}${encodeURIComponent(user.email!)}>` },
    });

    return res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (e: any) {
    console.error("invoice email error:", e?.message || e);
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
}
