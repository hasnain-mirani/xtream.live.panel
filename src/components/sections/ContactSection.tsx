"use client";

import { useMemo, useState } from "react";
import { Mail, MapPin, Phone, Send, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const HELP_TOPICS = [
  "Order status",
  "Installation help",
  "Playlist not loading",
  "Change/Upgrade plan",
  "Billing/Invoice",
  "Reseller inquiry",
];

type Errors = Partial<Record<"name"|"email"|"subject"|"message", string>>;

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function ContactSection({
  address = "2750 Quadra Street Victoria Road, Los Angeles, United States",
  email = "support@xtremetv.live",
  phone = " +44 7365254030",
  whatsapp = " +44 7365254030",
  className,
}: {
  address?: string; email?: string; phone?: string; whatsapp?: string; className?: string;
}) {
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);
  const [msg, setMsg] = useState("");
  const [subject, setSubject] = useState("");

  // local form state for client-side validation
  const [nameVal, setNameVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [messageVal, setMessageVal] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function validate(fields?: {name?: string; email?: string; subject?: string; message?: string;}): Errors {
    const n = (fields?.name ?? nameVal).trim();
    const e = (fields?.email ?? emailVal).trim();
    const s = (fields?.subject ?? subject).trim();
    const m = (fields?.message ?? messageVal).trim();

    const err: Errors = {};
    if (n.length < 2) err.name = "Please enter your full name.";
    if (!emailOk(e)) err.email = "Please enter a valid email address.";
    if (m.length < 10) err.message = "Message must be at least 10 characters.";
    // subject is optional in your API; validate only if you want it required:
    // if (!s) err.subject = "Please add a subject.";
    return err;
  }

  const formInvalid = useMemo(() => {
    const v = validate();
    return Object.keys(v).length > 0;
  }, [nameVal, emailVal, subject, messageVal]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const fd = new FormData(e.currentTarget);
  // honeypot (ensure it's empty)
  if (String(fd.get("company") || "").trim() !== "") return;

  // Build a clean JSON payload
const payload = {
  name: nameVal.trim(),
  email: emailVal.trim(),
  subject: subject.trim(),
  message: messageVal.trim(),
  company: "", // honeypot empty
};

await fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});


  setPending(true); setOk(null); setMsg("");
  try {
    const r = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const j = await r.json().catch(() => ({}));
    setOk(r.ok);
    setMsg(j.message ?? (r.ok ? "Message sent!" : "Failed to send"));

    if (!r.ok && j.missing) {
      // Show exactly which fields the server thinks are missing
      setMsg(`Missing required fields: ${j.missing.join(", ")}`);
    }

    if (r.ok) (e.target as HTMLFormElement).reset();
  } catch {
    setOk(false); setMsg("Network error. Please try again.");
  } finally {
    setPending(false);
  }
}

  const waHref = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hi XtrmIPTV! I need help with " + (subject || "…")
  )}`;

  return (
    <section className={cn("py-14 md:py-20", className)}>
      <div className="container mx-auto px-4 grid gap-10 md:grid-cols-2">
        {/* LEFT: info */}
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Contact Us</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            You can use this form to send us your inquiries and purchase requests. Thank you for choosing XtrmIPTV.
          </p>

          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <span>{address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-primary" />
              <a href={`mailto:${email}`} className="hover:underline">{email}</a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-primary" />
              <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
            </li>
          </ul>

          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-5 py-2.5 font-semibold shadow hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp us
          </a>

          <div className="mt-6">
            <div className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Quick help topics</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {HELP_TOPICS.map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setSubject(t)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs hover:bg-muted",
                    subject === t && "bg-primary text-primary-foreground border-primary"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border bg-card ring-1 ring-black/5 shadow-sm p-5 md:p-6"
        >
          <h3 className="text-lg font-bold">Submit Message</h3>

          <form onSubmit={onSubmit} className="mt-4 space-y-3" noValidate>
            <div>
              <input
                name="name" type="text" placeholder="Your Name" required
                value={nameVal} onChange={(e)=>setNameVal(e.target.value)}
                aria-invalid={!!errors.name}
                className={cn(
                  "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  errors.name && "border-red-500"
                )}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <input
                name="email" type="email" placeholder="example@email.com" required
                value={emailVal} onChange={(e)=>setEmailVal(e.target.value)}
                aria-invalid={!!errors.email}
                className={cn(
                  "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  errors.email && "border-red-500"
                )}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div>
              <input
                name="subject" type="text" placeholder="Your Message Subject"
                value={subject} onChange={(e)=>setSubject(e.target.value)}
                aria-invalid={!!errors.subject}
                className={cn(
                  "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  errors.subject && "border-red-500"
                )}
              />
              {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
            </div>

            <div>
              <textarea
                name="message" rows={6} placeholder="Your Message Here" required
                value={messageVal} onChange={(e)=>setMessageVal(e.target.value)}
                aria-invalid={!!errors.message}
                className={cn(
                  "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  errors.message && "border-red-500"
                )}
              />
              {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
            </div>

            {/* honeypot */}
            <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

          <button
  type="submit"
  disabled={pending}                       // ✅ only lock while sending
  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-semibold w-full sm:w-auto disabled:opacity-60"
>
  <Send className="h-4 w-4" />
  {pending ? "Sending..." : "Send Message"}
</button>

            {ok !== null && (
              <div className={cn("text-sm mt-2", ok ? "text-emerald-600" : "text-red-600")}>
                {msg}
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
