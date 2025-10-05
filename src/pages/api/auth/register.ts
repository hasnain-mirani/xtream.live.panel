// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { serialize } from "cookie";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Invoice from "@/models/Invoice";
import { signJwt } from "@/lib/auth"; // rename from your signToken

function genInvoiceNo() {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(Math.random()*10000).toString().padStart(4,"0")}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    await connectDB();

    const { name, email, password } = (req.body || {}) as {
      name?: string; email?: string; password?: string;
    };

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: "user" });

    // (Optional) create a PENDING invoice with your bank details
    const planName = process.env.DEFAULT_PLAN_NAME || "Subscription";
    const amount   = Number(process.env.DEFAULT_PLAN_AMOUNT || "19.99");
    const currency = process.env.DEFAULT_PLAN_CURRENCY || "USD";
    const dueDays  = Number(process.env.DEFAULT_INVOICE_DUE_DAYS || "5");
    const dueDate  = new Date(Date.now() + dueDays * 24 * 3600 * 1000);

    const invoice = await Invoice.create({
      invoiceNo: genInvoiceNo(),
      userId: user._id,
      status: "PENDING",
      currency,
      amount,
      items: [{ name: planName, qty: 1, unitPrice: amount, total: amount }],
      business: {
        name: process.env.BUSINESS_NAME || "",
        address: process.env.BUSINESS_ADDRESS || "",
        email: process.env.BUSINESS_EMAIL || "",
      },
      bank: {
        name: process.env.BANK_NAME || "",
        accountName: process.env.BANK_ACCOUNT_NAME || "",
        accountNo: process.env.BANK_ACCOUNT_NO || "",
        sortCode: process.env.BANK_SORT_CODE || "",
        iban: process.env.BANK_IBAN || "",
        swift: process.env.BANK_SWIFT || "",
      },
      dueDate,
      notes: "Please pay by bank transfer and include the Invoice No in the payment reference.",
    });

    const token = signJwt({ uid: user._id.toString(), role: "user" }, 7);

    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    );

    // (Optional) fire-and-forget invoice email
    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    fetch(`${base}/api/invoices/${invoice._id}/email`, { method: "POST" }).catch(() => {});

    return res.status(201).json({
      ok: true,
      user: { id: user._id.toString(), name: user.name, email: user.email },
      invoiceId: invoice._id.toString(),
    });
  } catch (err: any) {
    console.error("register error:", err);
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
