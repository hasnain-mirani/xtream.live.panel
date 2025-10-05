import { Schema, models, model } from "mongoose";

const ChannelSchema = new Schema(
  {
    name: { type: String, index: true },
    url: { type: String },
    logo: String,
    tvgId: { type: String, index: true },
    group: String,
    country: { type: String, index: true },  // "US" | "UK" | etc
    language: String,
    provider: { type: String, index: true }, // "pluto"
  },
  { timestamps: true }
);

ChannelSchema.index({ provider: 1, tvgId: 1 }, { unique: false });
ChannelSchema.index({ provider: 1, name: 1 });

export type ChannelDoc = {
  _id: string;
  name: string;
  url: string;
  logo?: string;
  tvgId?: string;
  group?: string;
  country?: string;
  language?: string;
  provider: string;
};

export default models.Channel || model("Channel", ChannelSchema);
