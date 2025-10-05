// src/models/Invoice.ts
import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
  Types,
} from "mongoose";

/* ---------------------- Line items ---------------------- */
const ItemSchema = new Schema(
  {
    desc: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    unit: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

/* ---------------------- Bank & Business blocks ---------------------- */
const BankSchema = new Schema(
  {
    name: { type: String, default: "" },          // e.g. Wise (Europe SA)
    accountName: { type: String, default: "" },   // e.g. Muhammad Abdullah Haider Khan
    accountNo: { type: String, default: "" },     // optional
    sortCode: { type: String, default: "" },      // optional
    iban: { type: String, default: "" },          // e.g. BE64 9674 9572 7152
    swift: { type: String, default: "" },         // e.g. TRWIBEB1XXX
    currency: { type: String, default: "EUR" },   // bank account currency
  },
  { _id: false }
);

const BusinessSchema = new Schema(
  {
    name: { type: String, default: "" },
    address: { type: String, default: "" },
    email: { type: String, default: "" },
  },
  { _id: false }
);

/* ---------------------- Status enum (DB) ---------------------- */
/** DB uses lowercase workflow values. UI can map them to PENDING/PAID/CANCELLED. */
const DB_STATUS = ["draft", "due", "paid", "void"] as const;

/* ---------------------- Invoice schema ---------------------- */
const InvoiceSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", index: true, required: true },

    /** Preferred unique public number. Always set this to a real string on create. */
    invoiceNo: { type: String, default: undefined },

    /** Legacy alias kept for older UI code; not unique. */
    number: { type: String, index: true, default: undefined },

    currency: { type: String, default: "EUR" },

    items: { type: [ItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    /** DB workflow status (lowercase) */
    status: { type: String, enum: DB_STATUS, default: "due", index: true },

    /** Optional due date for payment/period end */
    dueDate: { type: Date, default: null },

    /** Optional business and bank sections (printed in PDFs/emails) */
    business: { type: BusinessSchema, default: undefined },
    bank: { type: BankSchema, default: undefined },

    /** Freeform metadata */
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

/* ---------------------- Indexes ---------------------- */
/** Unique only for real strings; null/undefined values are NOT indexed. */
InvoiceSchema.index(
  { invoiceNo: 1 },
  { unique: true, partialFilterExpression: { invoiceNo: { $type: "string" } } }
);

/** Helpful sort index for listing a user's invoices */
InvoiceSchema.index({ userId: 1, createdAt: -1 });

/* ---------------------- Instance helpers ---------------------- */
/** Map DB status -> UI status */
InvoiceSchema.methods.uiStatus = function (): "PENDING" | "PAID" | "CANCELLED" {
  const s = String(this.status || "").toLowerCase();
  if (s === "paid") return "PAID";
  if (s === "void") return "CANCELLED";
  return "PENDING";
};

/* ---------------------- Types ---------------------- */
export type InvoiceDoc = InferSchemaType<typeof InvoiceSchema> & { _id: string };

/* ---------------------- Model ---------------------- */
const Invoice: Model<InvoiceDoc> =
  (models.Invoice as Model<InvoiceDoc>) || model<InvoiceDoc>("Invoice", InvoiceSchema);

export default Invoice;
