type KP = { label: string; value: string };
export default function KpiCards({ items }: { items: KP[] }) {
  return (
    <div style={{display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12}}>
      {items.map((k, i) => (
        <div key={i} style={{border: "1px solid #eee", borderRadius: 12, padding: 16}}>
          <div style={{opacity: 0.7, fontSize: 12}}>{k.label}</div>
          <div style={{fontSize: 24, fontWeight: 700}}>{k.value}</div>
        </div>
      ))}
    </div>
  );
}
