// src/components/DiseaseChart.jsx
// Animated bar chart of top detected diseases — pure CSS, no library needed

export default function DiseaseChart({ records, t }) {
  if (!records || records.length === 0) return null;

  // Count diseases
  const counts = {};
  records.forEach(r => {
    const name = r.disease.replace(/___/g, " · ").replace(/_/g, " ");
    counts[name] = (counts[name] || 0) + 1;
  });

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);

  const max = sorted[0]?.[1] || 1;

  const COLORS = [
    "var(--green)", "var(--amber)", "var(--blue)",
    "#c084fc", "#fb923c", "#38bdf8", "#f472b6",
  ];

  return (
    <div className="card" style={{ marginTop: 0 }}>
      <div className="card-title">Disease distribution</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map(([name, count], i) => (
          <div key={name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "var(--text-2)", maxWidth: "75%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
              <span style={{ color: "var(--text-3)", fontWeight: 600 }}>{count}</span>
            </div>
            <div style={{ height: 6, background: "var(--bg4)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(count / max) * 100}%`,
                background: COLORS[i % COLORS.length],
                borderRadius: 3,
                transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
                animationDelay: `${i * 0.1}s`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
