// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Invoice from "@/models/Invoice";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not signed in" });

    const { uid } = jwt.verify(token, process.env.JWT_SECRET!) as { uid: string };
    const user = await User.findById(uid).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    const invoice = await Invoice.findOne({ userId: uid }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        isActive: !!user.isActive,
        serviceUsername: user.serviceUsername,
      },
      invoice: invoice
        ? {
            id: String(invoice._id),
            invoiceNo: invoice.invoiceNo,
            status: invoice.status,
            amount: invoice.amount,
            currency: invoice.currency,
            dueDate: invoice.dueDate,
          }
        : null,
    });
  } catch (e: any) {
    return res.status(401).json({ error: "Invalid session" });
  }
}
