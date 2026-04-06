import { useEffect, useRef } from "react";

const Fireworks = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      alpha: number; color: string; size: number; decay: number;
    }

    interface Rocket {
      x: number; y: number; vy: number; targetY: number; color: string;
    }

    const colors = [
      "hsl(43, 76%, 52%)", "hsl(43, 80%, 65%)", "hsl(345, 60%, 45%)",
      "hsl(30, 80%, 55%)", "hsl(50, 90%, 60%)", "hsl(20, 70%, 50%)",
    ];

    const launchRocket = () => {
      rockets.push({
        x: Math.random() * canvas.width,
        y: canvas.height,
        vy: -(3 + Math.random() * 3),
        targetY: canvas.height * (0.15 + Math.random() * 0.35),
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const count = 30 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 1 + Math.random() * 3;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: 1.5 + Math.random() * 1.5,
          decay: 0.008 + Math.random() * 0.012,
        });
      }
    };

    let timer = 0;
    const animate = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      timer++;
      if (timer % 60 === 0 || (timer % 35 === 0 && Math.random() > 0.5)) launchRocket();

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();
        if (r.y <= r.targetY) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.alpha -= p.decay;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default Fireworks;
