import { Schema, model, models } from "mongoose";
export type PlanDoc = { _id: string; name: string; priceUsd: number; durationDays: number };
const planSchema = new Schema<PlanDoc>({ name:{type:String,required:true}, priceUsd:{type:Number,default:0}, durationDays:{type:Number,required:true} });
export const Plan = models.Plan || model<PlanDoc>("Plan", planSchema);
