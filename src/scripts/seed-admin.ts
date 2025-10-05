// scripts/seed-admin.ts
import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB as dbConnect } from "@/lib/db";
import User from "@/models/User";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const pass  = process.env.ADMIN_PASSWORD;

  if (!email || !pass) {
    throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD missing in .env.local");
  }

  await dbConnect();

  const passwordHash = await bcrypt.hash(pass, 10);
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name: "Admin", email, passwordHash, role: "admin", isActive: true } },
    { new: true, upsert: true }
  ).lean();

  console.log("Admin seeded:", { id: String(user?._id), email });
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
