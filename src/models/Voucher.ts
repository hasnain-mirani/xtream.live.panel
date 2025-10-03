import { Schema, model, models } from "mongoose";

const schema = new Schema({
  code: { type: String, unique: true, required: true },
  months: { type: Number, enum: [1,3,6,12], required: true },
  usedBy: { type: String, default: null },
  usedAt: Date,
  createdAt: { type: Date, default: Date.now },
}, { collection: "vouchers" });

export const Voucher = models.Voucher || model("Voucher", schema);
