import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import { isValidObjectId } from "mongoose";
import { mailer } from "@/lib/mailer"; // ✅ not makeTransport


/** Narrow req.query.id → string */
function getIdParam(req: NextApiRequest) {
  const raw = req.query.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  return id ?? "";
}

/** Light “lean” shapes so TS is happy */
type LeanUser = { email?: string; name?: string } | null;
type LeanInvoice = {
  _id: string;
  invoiceNo?: string;
  status?: "PENDING" | "PAID" | "CANCELLED" | string;
  currency?: string;
  amount?: number;
  dueDate?: string | Date;
  business?: { name?: string; address?: string; email?: string };
  bank?: {
    name?: string; accountName?: string; accountNo?: string;
    sortCode?: string; iban?: string; swift?: string;
  };
  userId?: string;
} | null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const id = getIdParam(req);
  if (!isValidObjectId(id)) return res.status(400).json({ error: "invalid id" });

  await connectDB();

  const inv = (await Invoice.findById(id).lean()) as LeanInvoice;
  if (!inv) return res.status(404).json({ error: "invoice not found" });

  const user = (await User.findById(inv.userId).lean()) as LeanUser;
  if (!user?.email) return res.status(400).json({ error: "user email missing" });

  // Safe values with fallbacks
  const host = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const invoiceUrl = `${host}/invoice/${id}`;
  const bizName = inv.business?.name || "our service";
  const amount = Number(inv.amount ?? 0);
  const currency = inv.currency || "USD";
  const due = inv.dueDate ? new Date(inv.dueDate) : new Date();
  const invNo = inv.invoiceNo || id;
  const status = inv.status || "PENDING";

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial">
      <h2>Invoice ${invNo} – ${status}</h2>
      <p>Hi ${user.name || ""},</p>
      <p>Thanks for registering with ${bizName}.</p>
      <p><b>Amount due:</b> ${currency} ${amount.toFixed(2)}</p>
      <p><b>Due date:</b> ${due.toLocaleDateString()}</p>
      <p>Please pay by bank transfer and include <b>${invNo}</b> in the payment reference.</p>
      <p><a href="${invoiceUrl}">View/Print your invoice</a></p>
      <hr/>
      <p>
        <b>Bank:</b> ${inv.bank?.name ?? ""}<br/>
        <b>Account Name:</b> ${inv.bank?.accountName ?? ""}<br/>
        <b>Account No:</b> ${inv.bank?.accountNo ?? ""}<br/>
        ${inv.bank?.sortCode ? `<b>Sort Code:</b> ${inv.bank.sortCode}<br/>` : ""}
        ${inv.bank?.iban ? `<b>IBAN:</b> ${inv.bank.iban}<br/>` : ""}
        ${inv.bank?.swift ? `<b>SWIFT:</b> ${inv.bank.swift}<br/>` : ""}
      </p>
    </div>
  `;

  const from = process.env.SMTP_FROM || "support@xtremetv.live";
  const transport = mailer();
  await transport.sendMail({
    from,
    to: user.email,
    subject: `Invoice ${invNo} – ${status}`,
    html,
  });

  return res.status(200).json({ ok: true });
}
