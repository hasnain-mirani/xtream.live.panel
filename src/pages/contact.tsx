// src/pages/contact.tsx
import Navbar from "@/components/site/Navbar";
export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h1 className="text-3xl font-bold mb-6">Contact</h1>
          <p className="opacity-80 mb-4">Email: support@yourdomain.com</p>
          {/* Add a form later if you want */}
        </div>
      </main>
    </>
  );
}
