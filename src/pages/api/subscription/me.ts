import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { Subscription } from "@/models/Subscription";
import { getUserFromReq } from "@/lib/jwt";
export default async function handler(req:NextApiRequest,res:NextApiResponse){ await connectDB(); const payload = getUserFromReq(req); if(!payload) return res.status(401).json({message:"Not logged in"}); const sub = await Subscription.findOne({ userId: payload.id }).lean(); if(!sub) return res.json({status:"none"}); return res.json({ status: sub.status, trialEndsAt: sub.trialEndsAt }); }
