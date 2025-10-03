import { Schema, model, models } from "mongoose";

export type ChannelDoc = {
  _id: string;
  key: string;           // unique id like "news-hd"
  name: string;          // display name
  url: string;           // HLS .m3u8
  category?: string;     // e.g., "News", "Sports"
  order?: number;        // sort priority
  active: boolean;
};

const channelSchema = new Schema<ChannelDoc>({
  key: { type: String, unique: true, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  url:  { type: String, required: true },
  category: { type: String, default: "" },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export const Channel = models.Channel || model<ChannelDoc>("Channel", channelSchema);
