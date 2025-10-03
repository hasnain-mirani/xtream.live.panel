// src/pages/faq.tsx
import Navbar from "@/components/site/Navbar";
export default function FAQ() {
  return (
    <>
      <Navbar />
      <main className="bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h1 className="text-3xl font-bold mb-6">FAQ</h1>
          <div className="space-y-4 opacity-90">
            <p><b>Q:</b> Do I need a long-term contract?</p>
            <p><b>A:</b> No. Cancel anytime.</p>
          </div>
        </div>
      </main>
    </>
  );
}
