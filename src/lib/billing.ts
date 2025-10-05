// src/lib/billing.ts
export const BANK = {
  accountHolder: "Muhammad Abdullah Haider Khan",
  bankName: "Wise (Europe SA)",
  bankAddress: "Rue du Trône 100, 3rd Floor, Brussels, 1050, Belgium",
  iban: "BE64 9674 9572 7152",
  swift: "TRWIBEB1XXX",
  currency: "EUR",
  canReceive: "SEPA and 100+ countries",
};

export const PAYMENT_NOTE = `Payments should be made in EUR to the above Wise account.
Please include your invoice number in the payment reference.`;

/** A tiny HTML safe helper (only what we need) */
export function esc(s: string) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
