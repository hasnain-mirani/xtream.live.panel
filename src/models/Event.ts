import { Schema, model, models, Types } from "mongoose";

export type EventDoc = {
  _id: string;
  userId: Types.ObjectId;
  type: "watch_ping" | "upgrade_intent";
  meta?: Record<string, any>;
  createdAt: Date;
};

const eventSchema = new Schema<EventDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["watch_ping", "upgrade_intent"], required: true },
    meta: { type: Object, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Event = models.Event || model<EventDoc>("Event", eventSchema);
