export const DEFAULT_CURRENCY =
  process.env.NEXT_PUBLIC_CURRENCY || "GBP";

// Pick a stable locale per currency to avoid SSR/CSR mismatch
const LOCALE_BY_CCY: Record<string, string> = {
  USD: "en-US",
  GBP: "en-GB",
  EUR: "en-IE",
};

export function money(amount: number, currency = DEFAULT_CURRENCY) {
  const locale = LOCALE_BY_CCY[currency] || "en";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "symbol", // ensures "$", "£", "€" etc.
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
export function dateTime(iso: string, locale = "en-GB") {
  // Use UTC so SSR/CSR match exactly
  return new Intl.DateTimeFormat(locale, {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "UTC",
  }).format(new Date(iso));
}

export function dateOnly(iso: string, locale = "en-GB") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric", month: "2-digit", day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}
