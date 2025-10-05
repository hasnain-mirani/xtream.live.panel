// src/pages/api/invoices/[id]/pdf.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { isValidObjectId } from "mongoose";
import PDFDocument from "pdfkit";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import { BANK as FALLBACK_BANK, PAYMENT_NOTE } from "@/lib/billing";

type LeanInvoice = {
  _id: any;
  invoiceNo?: string;
  number?: string;
  business?: { name?: string; address?: string; email?: string };
  status?: string;
  createdAt?: Date | string;
  dueDate?: Date | string;
  currency?: string;
  amount?: number;
  items?: Array<
    | { name?: string; desc?: string; qty?: number; unit?: number; total?: number }
    | any
  >;
  bank?: {
    name?: string;
    accountName?: string;
    accountNo?: string;
    sortCode?: string;
    iban?: string;
    swift?: string;
    currency?: string;
  };
} | null;

const fmtMoney = (n: number, c = "EUR") => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(n);
  } catch {
    return `${n.toFixed(2)} ${c}`;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { id } = req.query;
  const _id = String(Array.isArray(id) ? id[0] : id || "");
  if (!isValidObjectId(_id)) return res.status(400).json({ error: "invalid id" });

  try {
    await connectDB();
    const inv = (await Invoice.findById(_id).lean()) as LeanInvoice;
    if (!inv) return res.status(404).json({ error: "not found" });

    // ---------- Normalize fields ----------
    const invoiceNo = inv.invoiceNo || inv.number || _id;
    const businessName = inv.business?.name || "Invoice";
    const businessAddr = inv.business?.address || "";
    const businessEmail = inv.business?.email || "";
    const status = (inv.status || "PENDING").toString().toUpperCase();
    const createdAt = inv.createdAt ? new Date(inv.createdAt) : new Date();
    const dueDate = inv.dueDate ? new Date(inv.dueDate) : createdAt;
    const currency = inv.currency || FALLBACK_BANK.currency || "EUR";
    const amount = Number(inv.amount ?? 0);

    // Prefer invoice-embedded bank details; fallback to Wise details
    const BANK = {
      name: inv.bank?.name || FALLBACK_BANK.bankName,
      accountName: inv.bank?.accountName || FALLBACK_BANK.accountHolder,
      accountNo: inv.bank?.accountNo || "",
      sortCode: inv.bank?.sortCode || "",
      iban: inv.bank?.iban || FALLBACK_BANK.iban,
      swift: inv.bank?.swift || FALLBACK_BANK.swift,
      currency: inv.bank?.currency || FALLBACK_BANK.currency,
      address: FALLBACK_BANK.bankAddress,
    };

    // Items: support {name,qty,total} and/or {desc,qty,unit,total}
    const items = Array.isArray(inv.items)
      ? inv.items.map((it) => {
          const desc = (it as any).desc ?? (it as any).name ?? "";
          const qty = Number((it as any).qty ?? 1);
          const unit = Number((it as any).unit ?? 0);
          const total =
            typeof (it as any).total === "number"
              ? (it as any).total
              : Number((qty * unit).toFixed(2));
          return { desc: String(desc), qty, unit, total };
        })
      : [];

    // ---------- Prepare headers (only after validations) ----------
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Invoice-${invoiceNo}.pdf"`
    );
    res.setHeader("Cache-Control", "no-store");

    // ---------- Create PDF ----------
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    doc.pipe(res);

    // Header
    doc.fontSize(18).fillColor("#0b0f1f").text(businessName, { continued: false });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#555");
    if (businessAddr) doc.text(businessAddr);
    if (businessEmail) doc.text(businessEmail);
    doc.moveDown();

    // Invoice meta
    doc
      .fillColor("#000")
      .fontSize(16)
      .text(`Invoice ${invoiceNo}`);
    doc
      .fontSize(10)
      .text(`Status: ${status}`)
      .text(`Created: ${createdAt.toLocaleString()}`)
      .text(`Due: ${dueDate.toLocaleDateString()}`);
    doc.moveDown();

    // Line items table (simple)
    doc.fontSize(12).text("Items");
    doc.moveTo(doc.x, doc.y + 4).lineTo(547, doc.y + 4).strokeColor("#e5e7eb").stroke();
    doc.moveDown(0.6);

    if (items.length === 0) {
      doc.fontSize(10).fillColor("#555").text("No items");
    } else {
      items.forEach((it) => {
        const left = `${it.desc}  x${it.qty}`;
        const right = fmtMoney(it.total, currency);
        doc
          .fontSize(10)
          .fillColor("#111")
          .text(left, { continued: true })
          .text(right, { align: "right" });
      });
    }

    doc.moveDown();
    doc
      .fontSize(12)
      .fillColor("#000")
      
    doc.moveDown();

    // Bank block
    doc.fontSize(12).fillColor("#000").text("💳 Bank Payment Details");
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#111");
    doc.text(`Account Holder: ${BANK.accountName}`);
    doc.text(`Bank Name: ${BANK.name}`);
    doc.text(`Bank Address: ${BANK.address}`);
    if (BANK.accountNo) doc.text(`Account No: ${BANK.accountNo}`);
    if (BANK.sortCode) doc.text(`Sort Code: ${BANK.sortCode}`);
    if (BANK.iban) doc.text(`IBAN: ${BANK.iban}`);
    if (BANK.swift) doc.text(`SWIFT/BIC: ${BANK.swift}`);
    doc.text(`Currency: ${BANK.currency}`);
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#555")
      .text(PAYMENT_NOTE, { width: 480 });
    doc.moveDown();

    // Footer note
    doc
      .fontSize(10)
      .fillColor("#555")
      .text(
        `Please include ${invoiceNo} in your payment reference. Your subscription activates after payment confirmation.`,
        { width: 480 }
      );

    doc.end();
  } catch (e: any) {
    // If we haven't started streaming yet, we can return JSON.
    // If streaming already began, Next will log the error, but the client may see a broken PDF.
    if (!res.headersSent) {
      return res.status(500).json({ error: "server error", detail: String(e?.message || e) });
    }
    res.end();
  }
}
