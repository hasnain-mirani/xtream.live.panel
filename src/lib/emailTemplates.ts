// src/lib/emailTemplates.ts
import { env } from "./env";

/* ---------- config (env first, then fallback) ---------- */
const BRAND = {
  name: env.APP_BRAND || process.env.APP_BRAND || "XTremeTV",
  url: env.APP_URL || process.env.APP_URL || "https://xtremetv.live",
  logo:  process.env.APP_LOGO_URL || `${(env.APP_URL||process.env.APP_URL||"https://xtremetv.live")}/assets/logo.png`,
  supportUrl: env.SUPPORT_URL || process.env.SUPPORT_URL || "https://xtremetv.live/support",
  supportEmail: process.env.CONTACT_TO || "support@xtremetv.live",
  // WhatsApp
  waHuman: "+44 7449 275072",
  waE164: "447449275072",
};

const COLORS = {
  bg:    "#0f1220",
  card:  "#181b2f",
  text:  "#cfd3ff",
  mut:   "#9aa0ff",
  title: "#ffffff",
  line:  "#2a2f55",
  btn:   "#6b5cff",
  btnTxt:"#ffffff",
};

/* ---------- tiny helpers ---------- */
const baseStyles = `
  body{margin:0;background:${COLORS.bg}}
  img{border:0;display:block}
  table{border-collapse:collapse}
  a{color:${COLORS.mut}}
`;

function esc(s: string) {
  return String(s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// naive mustache-style replacement: {{key}}
function fill(tpl: string, data: Record<string, string>) {
  return tpl.replace(/{{\s*(\w+)\s*}}/g, (_, k) => data[k] ?? "");
}

function money(n: number, c: string) {
  try { return new Intl.NumberFormat("en-US",{style:"currency",currency:c}).format(n); }
  catch { return `${n.toFixed(2)} ${c}`; }
}

function waLink(text?: string) {
  const base = `https://wa.me/${BRAND.waE164}`;
  const t = encodeURIComponent(text || "Hello XTremeTV! I need help with my account.");
  return `${base}?text=${t}`;
}

function button(href: string, label: string) {
  return `
  <table role="presentation" cellspacing="0" cellpadding="0">
    <tr>
      <td bgcolor="${COLORS.btn}" style="border-radius:10px">
        <a href="${href}"
           style="display:inline-block;padding:12px 18px;font-size:14px;
                  color:${COLORS.btnTxt};text-decoration:none;font-weight:700;">
          ${esc(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

function hr() {
  return `<hr style="border:none;border-top:1px solid ${COLORS.line};margin:18px 0">`;
}

function row(label: string, valueHtml: string) {
  return `<p style="margin:6px 0"><b>${esc(label)}:</b> ${valueHtml}</p>`;
}

/* ---------- single unified layout with footer + WhatsApp ---------- */
const layout = (title: string, content: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${esc(title)}</title>
<style>${baseStyles}</style></head>
<body>
  <center>
    <table role="presentation" width="100%" bgcolor="${COLORS.bg}">
      <tr><td align="center" style="padding:24px">
        <table role="presentation" width="600" style="width:600px;max-width:100%;background:${COLORS.card};border-radius:14px;color:${COLORS.text};font-family:Arial,Helvetica,sans-serif">
          <tr><td style="padding:20px 24px">
            <table role="presentation" width="100%">
              <tr>
                <td style="text-align:left;vertical-align:middle">
                  <img src="${BRAND.logo}" height="28" alt="${esc(BRAND.name)}" style="border:none;outline:none;">
                </td>
                <td style="text-align:right;vertical-align:middle">
                  <a href="${BRAND.url}" style="color:${COLORS.mut};text-decoration:none;font-size:12px">${esc(BRAND.url.replace(/^https?:\/\//,''))}</a>
                </td>
              </tr>
            </table>
          </td></tr>

          <tr><td style="padding:0 24px 8px">
            <h1 style="margin:0 0 8px;color:${COLORS.title};font-size:22px">${esc(title)}</h1>
          </td></tr>

          <tr><td style="padding:0 24px 20px">
            ${content}
            ${hr()}
            <div style="font-size:12px;color:${COLORS.mut};line-height:1.6">
              Need help? Reply to this email or message us on WhatsApp:<br>
              <div style="margin-top:8px">
                ${button(waLink(), `WhatsApp • ${esc(BRAND.waHuman)}`)}
              </div>
              <div style="margin-top:8px">
                Support: <a href="${BRAND.supportUrl}" style="color:${COLORS.mut}">${esc(BRAND.supportUrl)}</a> •
                Email: <a href="mailto:${BRAND.supportEmail}" style="color:${COLORS.mut}">${esc(BRAND.supportEmail)}</a>
              </div>
              <div style="margin-top:8px">
                <a href="{{unsubscribe_url}}" style="color:${COLORS.mut}">Unsubscribe</a>
              </div>
            </div>
            <p style="margin:16px 0 0;font-size:11px;color:${COLORS.mut}">© ${new Date().getFullYear()} ${esc(BRAND.name)}. All rights reserved.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </center>
</body></html>`;

/* ================== TEMPLATES (HTML) ================== */

export function tplWelcome(data: {
  name: string; email: string; trial_end_date?: string;
  dashboard_url?: string; unsubscribe_url: string;
}) {
  const c = `
    <p style="margin:0 0 12px">Hi ${esc(data.name)}, welcome to ${esc(BRAND.name)}!</p>
    <p style="margin:0 0 12px">
      Your trial is live${data.trial_end_date ? ` until <strong style="color:${COLORS.title}">${esc(data.trial_end_date)}</strong>` : ""}.
    </p>
    <div style="margin:16px 0">
      ${button(esc(data.dashboard_url || env.DASHBOARD_URL || BRAND.url), "Open Dashboard")}
    </div>
    <p style="margin:0;font-size:13px;color:${COLORS.mut}">
      Login: <span style="color:${COLORS.title}">${esc(data.email)}</span>
    </p>
  `;
  return fill(layout("Welcome", c), { unsubscribe_url: data.unsubscribe_url });
}

export function tplTrialStarted(data: { name: string; trial_end_date: string; unsubscribe_url: string }) {
  const c = `
    <p style="margin:0 0 12px">Hi ${esc(data.name)}, your trial just started.</p>
    <p style="margin:0 0 12px">Ends on <strong style="color:${COLORS.title}">${esc(data.trial_end_date)}</strong>.</p>
    <div style="margin:16px 0">
      ${button(esc(env.DASHBOARD_URL || BRAND.url), "Go to Dashboard")}
    </div>
  `;
  return fill(layout("Trial Started", c), { unsubscribe_url: data.unsubscribe_url });
}

export function tplResetPassword(data: { name: string; reset_url: string; unsubscribe_url: string }) {
  const c = `
    <p style="margin:0 0 12px">Hi ${esc(data.name)}, click the button below to set a new password. This link expires in 30 minutes.</p>
    <div style="margin:16px 0">
      ${button(esc(data.reset_url), "Reset Password")}
    </div>
  `;
  return fill(layout("Reset Password", c), { unsubscribe_url: data.unsubscribe_url });
}

export function tplVerifyEmail(data: { name: string; verify_url: string; unsubscribe_url: string }) {
  const c = `
    <p style="margin:0 0 12px">Hi ${esc(data.name)}, confirm your email to activate your account.</p>
    <div style="margin:16px 0">
      ${button(esc(data.verify_url), "Verify Email")}
    </div>
    <p style="margin:12px 0 0;font-size:12px;color:${COLORS.mut}">
      If the button doesn’t work, copy and paste this link:<br>
      <span style="word-break:break-all">${esc(data.verify_url)}</span>
    </p>
  `;
  return fill(layout("Verify Email", c), { unsubscribe_url: data.unsubscribe_url });
}

export function tplPromo(data: {
  discount: string; promo_code: string; expiry_date: string; checkout_url: string; unsubscribe_url: string;
}) {
  const c = `
    <p style="margin:0 0 12px;font-size:20px">🔥 ${esc(data.discount)} OFF — Limited Time</p>
    <p style="margin:0 0 12px">Offer ends <strong style="color:${COLORS.title}">${esc(data.expiry_date)}</strong>.</p>
    <div style="margin:10px 0 16px">
      <span style="display:inline-block;background:${COLORS.line};color:${COLORS.title};font-weight:bold;padding:10px 14px;border-radius:8px">CODE: ${esc(data.promo_code)}</span>
    </div>
    ${button(esc(data.checkout_url), "Activate Offer")}
  `;
  return fill(layout("Promo", c), { unsubscribe_url: data.unsubscribe_url });
}

export function tplContact(data: {
  name: string; email: string; subject?: string; message: string; unsubscribe_url: string;
}) {
  const c = `
    ${row("Name", esc(data.name))}
    ${row("Email", `<a style="color:${COLORS.mut}" href="mailto:${esc(data.email)}">${esc(data.email)}</a>`)}
    ${data.subject ? row("Subject", esc(data.subject)) : ""}
    ${hr()}
    <div style="white-space:pre-wrap;line-height:1.6">${esc(data.message)}</div>
  `;
  return fill(layout("New contact message", c), { unsubscribe_url: data.unsubscribe_url });
}

export function tplInvoice(data: {
  name: string; invoiceNo: string; dateISO: string;
  items: Array<{desc:string; qty:number; unit:number; total:number}>;
  subtotal: number; tax: number; total: number; currency: string;
  unsubscribe_url: string;
}) {
  const rows = data.items.map(it => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid ${COLORS.line};">${esc(it.desc)}</td>
      <td align="right" style="padding:8px 0;border-bottom:1px solid ${COLORS.line};">${it.qty}</td>
      <td align="right" style="padding:8px 0;border-bottom:1px solid ${COLORS.line};">${money(it.unit, data.currency)}</td>
      <td align="right" style="padding:8px 0;border-bottom:1px solid ${COLORS.line};">${money(it.total, data.currency)}</td>
    </tr>
  `).join("");

  const c = `
    <p style="margin:0 0 10px">Hi ${esc(data.name)}, thanks for your purchase. Your invoice is below.</p>
    <p style="margin:0 0 10px"><b>Invoice #:</b> ${esc(data.invoiceNo)} &nbsp; • &nbsp; <b>Date:</b> ${esc(data.dateISO.slice(0,10))}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:6px">
      <tr>
        <th align="left"  style="border-bottom:1px solid ${COLORS.line};padding:8px 0;font-size:12px;color:${COLORS.mut}">Description</th>
        <th align="right" style="border-bottom:1px solid ${COLORS.line};padding:8px 0;font-size:12px;color:${COLORS.mut}">Qty</th>
        <th align="right" style="border-bottom:1px solid ${COLORS.line};padding:8px 0;font-size:12px;color:${COLORS.mut}">Unit</th>
        <th align="right" style="border-bottom:1px solid ${COLORS.line};padding:8px 0;font-size:12px;color:${COLORS.mut}">Total</th>
      </tr>
      ${rows}
    </table>
    <table role="presentation" width="100%" style="margin-top:10px">
      <tr><td align="right">
        <p style="margin:4px 0"><b>Subtotal:</b> ${money(data.subtotal, data.currency)}</p>
        <p style="margin:4px 0"><b>Tax:</b> ${money(data.tax, data.currency)}</p>
        <p style="margin:6px 0 0;font-size:16px"><b>Total:</b> ${money(data.total, data.currency)}</p>
      </td></tr>
    </table>
  `;
  return fill(layout("Invoice", c), { unsubscribe_url: data.unsubscribe_url });
}

/* ================== PLAIN-TEXT (recommended fallbacks) ================== */

export const txtWelcome = (p:{name:string; email:string; trial_end_date?:string; dashboard_url?:string}) =>
`Hi ${p.name}, welcome to ${BRAND.name}!
Your trial is live${p.trial_end_date ? ` until ${p.trial_end_date}` : ""}.
Dashboard: ${p.dashboard_url || env.DASHBOARD_URL || BRAND.url}
WhatsApp: ${BRAND.waHuman} (${waLink()})`;

export const txtTrialStarted = (p:{name:string; trial_end_date:string}) =>
`Hi ${p.name}, your trial started.
Ends: ${p.trial_end_date}
Dashboard: ${env.DASHBOARD_URL || BRAND.url}
WhatsApp: ${BRAND.waHuman} (${waLink()})`;

export const txtResetPassword = (p:{name:string; reset_url:string}) =>
`Hi ${p.name}, reset your password: ${p.reset_url}
This link expires in 30 minutes.
WhatsApp: ${BRAND.waHuman} (${waLink("I need help resetting my password")})`;

export const txtVerifyEmail = (p:{name:string; verify_url:string}) =>
`Hi ${p.name}, verify your email: ${p.verify_url}
WhatsApp: ${BRAND.waHuman} (${waLink("I need help verifying my email")})`;

export const txtPromo = (p:{discount:string; promo_code:string; expiry_date:string; checkout_url:string}) =>
`${p.discount} OFF — Limited Time
Ends: ${p.expiry_date}
CODE: ${p.promo_code}
Activate: ${p.checkout_url}
WhatsApp: ${BRAND.waHuman} (${waLink("Question about promo")})`;

export const txtContact = (p:{name:string; email:string; subject?:string; message:string}) =>
`New contact message
From: ${p.name} <${p.email}>
Subject: ${p.subject || "Website message"}

${p.message}

WhatsApp: ${BRAND.waHuman} (${waLink()})`;

export const txtInvoice = (p:{name:string; invoiceNo:string; total:number; currency:string}) =>
`Hi ${p.name}, your invoice #${p.invoiceNo}.
Total: ${money(p.total, p.currency)}
WhatsApp: ${BRAND.waHuman} (${waLink("Question about my invoice")})`;

/* export brand if you need it elsewhere */
export { BRAND, COLORS };
