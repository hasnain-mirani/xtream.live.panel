// src/models/Counter.ts
import { Schema, model, models, type Model } from "mongoose";

type CounterDoc = { key: string; dateKey: string; seq: number };

const CounterSchema = new Schema<CounterDoc>({
  key: { type: String, required: true, index: true },
  dateKey: { type: String, required: true, index: true }, // e.g. "2025-10-05"
  seq: { type: Number, required: true, default: 0 },
});

export const Counter: Model<CounterDoc> =
  (models.Counter as Model<CounterDoc>) || model<CounterDoc>("Counter", CounterSchema);

// helper to get next sequence per day
export async function nextSequence(key = "invoice") {
  const today = new Date();
  const dateKey = today.toISOString().slice(0,10); // YYYY-MM-DD
  const doc = await Counter.findOneAndUpdate(
    { key, dateKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).lean();
  return { dateKey, seq: doc!.seq };
}

// format like INV-20251005-0001
export async function nextInvoiceNo() {
  const { dateKey, seq } = await nextSequence("invoice");
  const compact = dateKey.replace(/-/g, ""); // 20251005
  const pad = String(seq).padStart(4, "0");
  return `INV-${compact}-${pad}`;
}
