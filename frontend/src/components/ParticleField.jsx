// src/components/ParticleField.jsx
// Subtle animated leaf particles floating in the background — unique visual

import { useEffect, useRef } from "react";

export default function ParticleField({ count = 18 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext("2d");
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;

    // Generate particles
    const particles = Array.from({ length: count }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      size:  Math.random() * 4 + 2,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.4 + 0.1,
      rot:   Math.random() * Math.PI * 2,
      rotV:  (Math.random() - 0.5) * 0.01,
    }));

    function drawLeaf(ctx, x, y, size, rot, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#3ecf6a";
      ctx.lineWidth   = 0.8;
      ctx.fillStyle   = "rgba(62,207,106,0.06)";
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(size, -size*0.5, size, size*0.5, 0, size);
      ctx.bezierCurveTo(-size, size*0.5, -size, -size*0.5, 0, -size);
      ctx.fill();
      ctx.stroke();
      // vein
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.globalAlpha = alpha * 0.6;
      ctx.stroke();
      ctx.restore();
    }

    let rafId;
    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x   += p.vx;
        p.y   += p.vy;
        p.rot += p.rotV;
        if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
        drawLeaf(ctx, p.x, p.y, p.size, p.rot, p.alpha);
      });
      rafId = requestAnimationFrame(animate);
    }
    animate();

    const onResize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", onResize); };
  }, [count]);

  return (
    <canvas ref={canvasRef} style={{
      position:"absolute", inset:0, width:"100%", height:"100%",
      pointerEvents:"none", zIndex:0,
    }}/>
  );
}
