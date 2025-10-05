// src/lib/mongo.ts
import { Types } from "mongoose";
export const isOid = (v: any) => Types.ObjectId.isValid(String(v || ""));
