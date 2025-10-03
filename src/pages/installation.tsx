// src/pages/installation.tsx
import Navbar from "@/components/site/Navbar";
export default function Installation() {
  return (
    <>
      <Navbar />
      <main className="bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h1 className="text-3xl font-bold mb-6">Installation</h1>
          <ul className="list-disc ml-6 space-y-2 opacity-90">
            <li>Android / iOS player setup</li>
            <li>Smart TV apps</li>
            <li>m3u / Xtream codes login</li>
          </ul>
        </div>
      </main>
    </>
  );
}
