import { Schema, model, models } from "mongoose";

export type PlaySessionDoc = {
  _id: string;
  userId: string;
  sessionId: string;   // random id per device
  lastPingAt: Date;
  expiresAt: Date;
};

const schema = new Schema<PlaySessionDoc>({
  userId: { type: String, index: true, required: true },
  sessionId: { type: String, unique: true, required: true },
  lastPingAt: { type: Date, default: () => new Date(), index: true },
  expiresAt: { type: Date, index: { expires: 0 } }, // TTL index (Mongo will expire)
}, { timestamps: true });

export const PlaySession = models.PlaySession || model<PlaySessionDoc>("PlaySession", schema);
