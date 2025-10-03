export function randomToken(len = 32) {
  // crypto-safe random base64url
  const buf = crypto.getRandomValues(new Uint8Array(len));
  return Buffer.from(buf).toString("base64url");
}
export function randomOtp() {
  return String(Math.floor(100000 + Math.random()*900000));
}
