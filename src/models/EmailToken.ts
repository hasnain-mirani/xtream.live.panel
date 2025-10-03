import { Schema, model, models } from "mongoose";

export type EmailTokenDoc = {
  _id: string;
  userId: string;
  kind: "verify" | "reset" | "magic";
  token: string;          // random base64url
  otp?: string;           // optional 6-digit for OTP flow
  expiresAt: Date;
  used: boolean;
};

const schema = new Schema<EmailTokenDoc>({
  userId: { type: String, index: true, required: true },
  kind: { type: String, enum: ["verify","reset","magic"], required: true },
  token: { type: String, unique: true, required: true },
  otp: { type: String, default: null },
  expiresAt: { type: Date, required: true, index: true },
  used: { type: Boolean, default: false },
}, { timestamps: true });

export const EmailToken = models.EmailToken || model<EmailTokenDoc>("EmailToken", schema);
