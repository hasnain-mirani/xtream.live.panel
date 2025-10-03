// src/pages/pricing.tsx
import Navbar from "@/components/site/Navbar";
export default function Pricing() {
  return (
    <>
      <Navbar />
      <main className="bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h1 className="text-3xl font-bold mb-6">Pricing</h1>
          <p className="opacity-80 mb-8">
            Choose Monthly, 3-Month, 6-Month, or Yearly. (Wire to your real checkout later)
          </p>
          {/* Put your real pricing cards here */}
        </div>
      </main>
    </>
  );
}
