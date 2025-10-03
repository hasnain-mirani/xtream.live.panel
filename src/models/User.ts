import { Schema, model, models } from "mongoose";

export type UserDoc = {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  active: boolean;
  verified: boolean;
};
const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    active: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = models.User || model<UserDoc>("User", userSchema);
