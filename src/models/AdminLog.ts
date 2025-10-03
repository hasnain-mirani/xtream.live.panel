import { Schema, model, models } from "mongoose";

const schema = new Schema({
  at: { type: Date, default: Date.now },
  action: String,
  adminEmail: String,      // fill if you have admin session; else null
  targetUserId: String,
  payload: Schema.Types.Mixed,
}, { collection: "admin_logs" });

export const AdminLog = models.AdminLog || model("AdminLog", schema);
