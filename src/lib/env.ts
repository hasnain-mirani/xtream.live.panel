import { z } from "zod";

const EnvSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: z.preprocess(v => String(v).toLowerCase() === "true", z.boolean()).default(true),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string().min(2),

  APP_BRAND: z.string().default("XTremeTV"),
  APP_URL: z.string().url(),
  DASHBOARD_URL: z.string().url(),
  SUPPORT_URL: z.string().url(),
  UNSUBSCRIBE_URL_BASE: z.string().url(),
});

export const env = EnvSchema.parse({
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  APP_BRAND: process.env.APP_BRAND,
  APP_URL: process.env.APP_URL,
  DASHBOARD_URL: process.env.DASHBOARD_URL,
  SUPPORT_URL: process.env.SUPPORT_URL,
  UNSUBSCRIBE_URL_BASE: process.env.UNSUBSCRIBE_URL_BASE,
});
