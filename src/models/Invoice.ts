import { Schema, model, models } from "mongoose";

const InvoiceSchema = new Schema(
  {
    invoiceNo: { type: String, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    status: { type: String, enum: ["PENDING", "PAID", "CANCELLED"], default: "PENDING", index: true },
    currency: String,
    amount: Number,
    items: [
      {
        name: String,
        qty: { type: Number, default: 1 },
        unitPrice: Number,
        total: Number,
      },
    ],
    business: {
      name: String,
      address: String,
      email: String,
    },
    bank: {
      name: String,
      accountName: String,
      accountNo: String,
      sortCode: String,
      iban: String,
      swift: String,
    },
    dueDate: Date,
    notes: String,
  },
  { timestamps: true }
);

export type InvoiceDoc = {
  _id: string; invoiceNo: string; userId: any; status: "PENDING"|"PAID"|"CANCELLED";
  currency: string; amount: number; items: Array<{name:string; qty:number; unitPrice:number; total:number;}>;
  business: any; bank: any; dueDate: Date; notes?: string;
};

export default models.Invoice || model("Invoice", InvoiceSchema);
