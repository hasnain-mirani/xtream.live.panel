// components/sections/ContactMap.tsx
export default function ContactMap({
  query = "2750 Quadra Street Victoria Road, Los Angeles, United States",
}: { query?: string }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <section className="pb-16">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl overflow-hidden border">
          <iframe
            title="Location map"
            src={src}
            className="h-[320px] w-full md:h-[420px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
