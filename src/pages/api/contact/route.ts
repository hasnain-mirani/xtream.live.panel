import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  // Honeypot guard
  if (form.get("company")) return NextResponse.json({ message: "ok" });

  const name = String(form.get("name") || "");
  const email = String(form.get("email") || "");
  const subject = String(form.get("subject") || "Website message");
  const message = String(form.get("message") || "");

  if (!name || !email || !message) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  // Example using Resend (recommended). Configure env vars first.
  // RESEND_API_KEY, CONTACT_TO, CONTACT_FROM
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || "web@yourdomain.com",
        to: [process.env.CONTACT_TO || "support@yourdomain.com"],
        subject: `[Contact] ${subject}`,
        html: `
          <h3>New Contact Message</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Subject:</b> ${subject}</p>
          <p><b>Message:</b></p>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        `,
      }),
    });

    if (!res.ok) throw new Error("Resend error");

    return NextResponse.json({ message: "Thanks! We received your message." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Failed to send. Please try again." }, { status: 500 });
  }
}
