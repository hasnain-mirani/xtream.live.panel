import { Schema, model, models } from "mongoose";

export type ProgramDoc = {
  _id: string;
  channelKey: string;
  title: string;
  start: Date;
  end: Date;
};

const schema = new Schema<ProgramDoc>({
  channelKey: { type: String, index: true, required: true },
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
}, { timestamps: true });

schema.index({ channelKey: 1, start: 1 });

export const Program = models.Program || model<ProgramDoc>("Program", schema);
