import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
export default async function handler(req:NextApiRequest,res:NextApiResponse){ if(req.method!=="POST") return res.status(405).end(); await connectDB(); const {name,email,password}=req.body||{}; if(!name||!email||!password) return res.status(400).json({message:"Missing fields"}); const exists=await User.findOne({email}); if(exists) return res.status(409).json({message:"Email already in use"}); const passwordHash = await bcrypt.hash(password,10); const user = await User.create({name,email,passwordHash,role:"user"}); const token = signToken({id:user._id.toString(), role:"user"}); res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/; SameSite=Lax`); return res.json({ok:true, user:{id:user._id,name:user.name,email:user.email}}); }
