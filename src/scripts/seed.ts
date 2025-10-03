import "dotenv/config";
import { connectDB } from "@/lib/db";
import { Plan } from "@/models/Plan";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
async function main(){ await connectDB(); const monthly = await Plan.findOneAndUpdate({name:"Monthly"},{name:"Monthly", priceUsd:9.99, durationDays:30},{upsert:true, new:true}); console.log("Plan:", monthly.name); const email = "admin@example.com"; const exists = await User.findOne({email}); if(!exists){ const passwordHash = await bcrypt.hash("admin123",10); await User.create({ name:"Admin", email, passwordHash, role:"admin" }); console.log("Admin user created:", email, "(password: admin123)"); } else { console.log("Admin user exists:", email); } process.exit(0); }
main().catch(e=>{ console.error(e); process.exit(1); });
