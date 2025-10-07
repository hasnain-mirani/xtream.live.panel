import { sendMail } from "@/lib/mailer";
import { env } from "@/lib/env";
import {
  tplWelcome, tplTrialStarted, tplResetPassword, tplVerifyEmail, tplPromo
} from "@/lib/emailTemplates";

const unsub = (email: string) => `${env.UNSUBSCRIBE_URL_BASE}${encodeURIComponent(email)}`;
if (typeof window !== "undefined") throw new Error("emailService is server-only");

// ========== Public API your app can call ==========
export async function emailWelcome(to: string, name: string, trialEnd?: Date) {
  const html = tplWelcome({
    name, email: to,
    trial_end_date: trialEnd ? trialEnd.toDateString() : undefined,
    dashboard_url: env.DASHBOARD_URL,
    unsubscribe_url: unsub(to),
  });
  await sendMail({ to, subject: `Welcome to ${env.APP_BRAND}!`, html, text:
`Welcome ${name}! Your trial is live.${trialEnd ? ` Ends ${trialEnd.toDateString()}.` : ""}
Open Dashboard: ${env.DASHBOARD_URL}` });
}

export async function emailTrialStarted(to: string, name: string, end: Date) {
  const html = tplTrialStarted({ name, trial_end_date: end.toUTCString(), unsubscribe_url: unsub(to) });
  await sendMail({ to, subject: "Your trial started", html });
}

export async function emailResetPassword(to: string, name: string, resetUrl: string) {
  const html = tplResetPassword({ name, reset_url: resetUrl, unsubscribe_url: unsub(to) });
  await sendMail({ to, subject: "Reset your password", html, text: `Reset link: ${resetUrl}` });
}

export async function emailVerify(to: string, name: string, verifyUrl: string) {
  const html = tplVerifyEmail({ name, verify_url: verifyUrl, unsubscribe_url: unsub(to) });
  await sendMail({ to, subject: "Verify your email", html, text: `Verify: ${verifyUrl}` });
}

export async function emailPromo(to: string, params: { discount: string; code: string; expires: string; checkoutUrl: string; }) {
  const html = tplPromo({
    discount: params.discount, promo_code: params.code,
    expiry_date: params.expires, checkout_url: params.checkoutUrl,
    unsubscribe_url: unsub(to),
  });
  await sendMail({ to, subject: `${params.discount} OFF — Limited time`, html });
}
