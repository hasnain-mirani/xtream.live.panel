import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { getUserFromReq } from "@/lib/jwt";
const TRIAL_HOURS = 48;
export default async function handler(req:NextApiRequest,res:NextApiResponse){ if(req.method!=="POST") return res.status(405).end(); await connectDB(); const payload = getUserFromReq(req); if(!payload) return res.status(401).json({message:"Not logged in"}); const now = new Date(); const existing = await Subscription.findOne({ userId: payload.id }); if(existing){ if(existing.status==="trial") return res.json({status:"trial", trialEndsAt: existing.trialEndsAt}); return res.status(400).json({message:"Subscription exists"}); } const trialEndsAt = new Date(now.getTime() + TRIAL_HOURS*60*60*1000); const created = await Subscription.create({ userId: payload.id, status: "trial", trialEndsAt }); return res.json({ status: created.status, trialEndsAt: created.trialEndsAt }); }
