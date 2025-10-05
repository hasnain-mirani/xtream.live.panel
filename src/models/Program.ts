import { Schema, models, model } from "mongoose";

const ProgramSchema = new Schema(
  {
    channelTvgId: { type: String, index: true }, // match by tvgId
    start: { type: Date, index: true },
    stop: { type: Date, index: true },
    title: String,
    desc: String,
    category: String,
    provider: { type: String, index: true }, // "pluto"
    country: { type: String, index: true },  // "US"/"UK"
  },
  { timestamps: true }
);

ProgramSchema.index({ provider: 1, country: 1, channelTvgId: 1, start: 1 });

export type ProgramDoc = {
  channelTvgId: string;
  start: Date;
  stop: Date;
  title?: string;
  desc?: string;
  category?: string;
  provider: string;
  country?: string;
};

export default models.Program || model("Program", ProgramSchema);
