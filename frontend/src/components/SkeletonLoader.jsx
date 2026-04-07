// src/components/SkeletonLoader.jsx — Skeleton loaders (advanced UX feature)
export function SkeletonCard({ lines = 3, height = 80 }) {
  return (
    <div style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:14, padding:18, overflow:"hidden" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
        <SkeletonBox w={40} h={40} radius={10} />
        <div style={{ flex:1 }}>
          <SkeletonBox w="70%" h={13} radius={6} style={{ marginBottom:7 }}/>
          <SkeletonBox w="45%" h={10} radius={6} />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox key={i} w={i === lines-1 ? "60%" : "100%"} h={11} radius={6} style={{ marginBottom:8 }}/>
      ))}
    </div>
  );
}

export function SkeletonBox({ w = "100%", h = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width:w, height:h, borderRadius:radius,
      background:"linear-gradient(90deg, var(--bg3) 25%, var(--bg4) 50%, var(--bg3) 75%)",
      backgroundSize:"200% 100%",
      animation:"shimmerMove 1.5s ease-in-out infinite",
      ...style,
    }}/>
  );
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
          <SkeletonBox w="100%" h={140} radius={0}/>
          <div style={{ padding:12 }}>
            <SkeletonBox w="80%" h={13} radius={6} style={{ marginBottom:8 }}/>
            <SkeletonBox w="55%" h={10} radius={6}/>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
      {[0,1,2,3].map(i => (
        <div key={i} style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:14, padding:"16px 18px" }}>
          <SkeletonBox w={34} h={34} radius={9} style={{ marginBottom:10 }}/>
          <SkeletonBox w="55%" h={22} radius={6} style={{ marginBottom:6 }}/>
          <SkeletonBox w="75%" h={10} radius={6}/>
        </div>
      ))}
    </div>
  );
}
