// src/models/User.ts  (or "@/models/User")
import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    // Identity
    email: {
      type: String,
      unique: true,
      index: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: { type: String, default: "" },

    // Auth
    passwordHash: { type: String, required: true },

    // Role & provisioning
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    isActive: { type: Boolean, default: false },
    serviceUsername: { type: String, default: null },
    servicePassword: { type: String, default: null },

    // Password reset
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// --- Types ---
export type Role = "user" | "admin";
export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string };

// Reuse model in dev (hot reload) or create it
const UserModel: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);

export default UserModel;
