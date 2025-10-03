// src/pages/about.tsx
import Navbar from "@/components/site/Navbar";
export default function About() {
  return (
    <>
      <Navbar />
      <main className="bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h1 className="text-3xl font-bold mb-6">About Us</h1>
          <p className="opacity-80">Short blurb about Xtream IPTV.</p>
        </div>
      </main>
    </>
  );
}
