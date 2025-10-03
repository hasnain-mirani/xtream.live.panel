import { Schema, model, models } from "mongoose";

export type WatchProgressDoc = {
  _id: string;
  userId: string;
  channelKey: string;
  playhead: number;    // seconds
  updatedAt: Date;
};

const schema = new Schema<WatchProgressDoc>({
  userId: { type: String, index: true, required: true },
  channelKey: { type: String, index: true, required: true },
  playhead: { type: Number, default: 0 },
}, { timestamps: true });

schema.index({ userId: 1, channelKey: 1 }, { unique: true });

export const WatchProgress = models.WatchProgress || model<WatchProgressDoc>("WatchProgress", schema);
