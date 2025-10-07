// src/models/ClientUser.ts
import { Schema, model, models } from "mongoose";

const ClientUserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  _id: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user", enum: ["user"] },
  isActive: { type: Boolean, default: true },
  // client-specific fields…
}, { timestamps: true });

export default models.ClientUser || model("ClientUser", ClientUserSchema, "client_users");
