import nodemailer, { type Transporter } from "nodemailer";
import { env } from "./env";
// src/lib/mailer.ts
import "server-only";        // <— ensures server-only usage

// ...

let _tx: Transporter | null = null;

function createTx(): Transporter {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE, // true => 465
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

// singleton transporter (avoids reconnect churn)
export function mailer(): Transporter {
  if (!_tx) _tx = createTx();
  return _tx;
}

export type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendMail({ to, subject, html, text, replyTo }: SendArgs) {
  const tx = mailer();
  const headers: Record<string, string> = {
    "List-Unsubscribe": `<${env.UNSUBSCRIBE_URL_BASE}${encodeURIComponent(to)}>`,
  };

  // You already DKIM-sign at the domain level; no need for Nodemailer DKIM here.
  return tx.sendMail({
    from: { name: env.APP_BRAND, address: env.SMTP_USER },
    to,
    subject,
    html,
    text,
    replyTo: replyTo ?? env.SMTP_USER,
    headers,
  });
}

// quick health check (optional)
export async function verifySmtp() {
  const tx = mailer();
  await tx.verify(); // throws if credentials or ports are wrong
}
