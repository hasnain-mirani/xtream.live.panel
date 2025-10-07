import { Schema, model, models, Types } from "mongoose";
export type SubscriptionDoc = {
  _id: string;
  userId: Types.ObjectId;
  planId?: Types.ObjectId | null;
  status: "trial" | "active" | "expired";
  
  trialEndsAt?: Date | null;
  activatedAt?: Date | null;
};
const subsSchema = new Schema<SubscriptionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", default: null },
    status: {
      type: String,
      enum: ["trial", "active", "expired"],
      required: true,
    },
    trialEndsAt: { type: Date, default: null },
    activatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
export const Subscription =
  models.Subscription || model<SubscriptionDoc>("Subscription", subsSchema);
