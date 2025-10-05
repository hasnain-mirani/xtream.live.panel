import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";
import { isValidObjectId } from "mongoose";
import PDFDocument from "pdfkit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const { id } = req.query;
  if (!isValidObjectId(String(id))) return res.status(400).json({ error: "invalid id" });

  await connectDB();
  interface InvoiceType {
    invoiceNo: string;
    business?: { name?: string; address?: string; email?: string };
    status?: string;
    createdAt?: Date | string;
    dueDate?: Date | string;
    items?: Array<{ name: string; qty: number; total: number }>;
    currency?: string;
    amount: number;
    bank?: {
      name?: string;
      accountName?: string;
      accountNo?: string;
      sortCode?: string;
      iban?: string;
      swift?: string;
    };
  }

  const inv = await Invoice.findById(id).lean() as InvoiceType | null;
  if (!inv) return res.status(404).json({ error: "not found" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="Invoice-${inv.invoiceNo}.pdf"`);

  const doc = new PDFDocument({ size: "A4", margin: 48 });
  doc.pipe(res);

  doc.fontSize(18).text(inv.business?.name || "Invoice", { continued: false });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#555")
    .text(inv.business?.address || "")
    .text(inv.business?.email || "");
  doc.moveDown();

  doc.fillColor("#000").fontSize(14).text(`Invoice ${inv.invoiceNo}`);
  doc.fontSize(10).text(`Status: ${inv.status}`);
  doc.text(`Created: ${new Date(inv.createdAt!).toLocaleString()}`);
  doc.text(`Due: ${new Date(inv.dueDate!).toLocaleDateString()}`);
  doc.moveDown();

  doc.fontSize(12).text("Items");
  doc.moveDown(0.5);
  inv.items?.forEach((it: any) => {
    doc.fontSize(10).text(`${it.name}  x${it.qty}`, { continued: true })
       .text(` ${inv.currency} ${Number(it.total).toFixed(2)}`, { align: "right" });
  });
  doc.moveDown();
  doc.fontSize(12).text(`Amount Due: ${inv.currency} ${inv.amount.toFixed(2)}`, { align: "right" });
  doc.moveDown();

  doc.fontSize(12).text("Bank transfer details");
  doc.fontSize(10).text(`Bank: ${inv.bank?.name}`);
  doc.text(`Account Name: ${inv.bank?.accountName}`);
  doc.text(`Account No: ${inv.bank?.accountNo}`);
  if (inv.bank?.sortCode) doc.text(`Sort Code: ${inv.bank.sortCode}`);
  if (inv.bank?.iban) doc.text(`IBAN: ${inv.bank.iban}`);
  if (inv.bank?.swift) doc.text(`SWIFT: ${inv.bank.swift}`);
  doc.moveDown();

  doc.fontSize(10).fillColor("#555").text(
    `Please include ${inv.invoiceNo} in your payment reference. Your subscription activates after payment confirmation.`
  );

  doc.end();
}
