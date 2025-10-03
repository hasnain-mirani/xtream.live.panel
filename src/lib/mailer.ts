export async function sendMail(to: string, subject: string, html: string) {
  // TODO: integrate with Resend, Sendgrid, Mailgun, SES, etc.
  console.log("MAIL =>", to, subject, html.slice(0,120)+"...");
}
