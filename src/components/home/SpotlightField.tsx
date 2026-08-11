"use client";
import { useEffect, useRef } from "react";

interface SpotlightFieldProps {
  className?: string;
  /** Starting hue (0-360) for the flowing color gradient. Default is a cool cyan-blue. */
  baseHue?: number;
  /** How far the gradient spans from baseHue (degrees). Kept under 180 so it reads as one cohesive family, not a rainbow. */
  hueRange?: number;
  /** Solid page background the canvas paints each frame — must match the section behind it. */
  backgroundColor?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  prevX: number;
  prevY: number;
  radius: number;
  depth: number; // 0 (background, small, gentle) .. 1 (foreground, larger, responsive)
}

const BASE_ALPHA = 0.03; // essentially invisible until the cursor is near
const MAX_ALPHA = 0.96;
const BASE_RADIUS_MIN = 1.0;
const BASE_RADIUS_MAX = 2.6;
const MAX_RADIUS_BONUS = 2.8;

const INTERACTION_RADIUS = 250; // outer edge of the spotlight
const INNER_RADIUS = 48; // fully lit inside this distance

const DRIFT_ACCEL = 0.006; // constant ambient wander, even off-spotlight
const MAX_DRIFT_SPEED = 0.35;
const SWIRL_STRENGTH = 0.13; // tangential force — makes lit particles orbit the cursor
const PULL_STRENGTH = 0.012; // gentle inward pull so the swirl doesn't fling particles away
const DAMPING = 0.963;

const LINE_DISTANCE = 100; // constellation lines only connect nearby *lit* particles

const SATURATION = 82;
const LIGHTNESS_BASE = 46;
const LIGHTNESS_MAX = 68;
const HUE_DRIFT_SPEED = 0.012; // degrees per ms — a slow, continuous color rotation

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const mod360 = (v: number) => ((v % 360) + 360) % 360;

const SpotlightField = ({
  className = "",
  baseHue = 195,
  hueRange = 150,
  backgroundColor = "238, 241, 246", // #EEF1F6
}: SpotlightFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];

    // A faint grain texture, generated once, tiled as a repeating pattern
    // — the kind of subtle imperfection that keeps a flat digital gradient
    // from looking sterile.
    let noisePattern: CanvasPattern | null = null;
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = 96;
    noiseCanvas.height = 96;
    const nctx = noiseCanvas.getContext("2d");
    if (nctx) {
      const imageData = nctx.createImageData(96, 96);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 255;
        imageData.data[i] = v;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = Math.random() * 22;
      }
      nctx.putImageData(imageData, 0, 0);
      noisePattern = ctx.createPattern(noiseCanvas, "repeat");
    }

    const buildParticles = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(100, Math.min(260, Math.floor((width * height) / 8500)));
      particles = Array.from({ length: count }, () => {
        const depth = Math.random();
        const x = Math.random() * width;
        const y = Math.random() * height;
        return {
          x,
          y,
          prevX: x,
          prevY: y,
          vx: (Math.random() - 0.5) * MAX_DRIFT_SPEED,
          vy: (Math.random() - 0.5) * MAX_DRIFT_SPEED,
          radius: BASE_RADIUS_MIN + depth * (BASE_RADIUS_MAX - BASE_RADIUS_MIN),
          depth,
        };
      });
    };

    buildParticles();
    window.addEventListener("resize", buildParticles);

    const mouse = { x: -9999, y: -9999, active: false };
    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= width && mouse.y <= height;
    };
    const handlePointerLeave = () => {
      mouse.active = false;
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);

    let raf = 0;

    const renderFrame = () => {
      const now = performance.now();
      const hueDrift = now * HUE_DRIFT_SPEED;

      ctx.fillStyle = `rgb(${backgroundColor})`;
      ctx.fillRect(0, 0, width, height);

      // Soft ambient glow behind the cursor, its hue slowly cycling along
      // with everything else so it never feels like a static prop.
      if (mouse.active) {
        const auraHue = mod360(baseHue + hueDrift);
        const aura = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          INTERACTION_RADIUS
        );
        aura.addColorStop(0, `hsla(${auraHue}, ${SATURATION}%, 62%, 0.13)`);
        aura.addColorStop(0.55, `hsla(${auraHue}, ${SATURATION}%, 58%, 0.05)`);
        aura.addColorStop(1, `hsla(${auraHue}, ${SATURATION}%, 58%, 0)`);
        ctx.fillStyle = aura;
        ctx.fillRect(
          mouse.x - INTERACTION_RADIUS,
          mouse.y - INTERACTION_RADIUS,
          INTERACTION_RADIUS * 2,
          INTERACTION_RADIUS * 2
        );
      }

      const lit: { p: Particle; proximity: number; hue: number }[] = [];

      for (const p of particles) {
        p.prevX = p.x;
        p.prevY = p.y;

        // Ambient wander — always on, so the field never sits still.
        p.vx += (Math.random() - 0.5) * DRIFT_ACCEL;
        p.vy += (Math.random() - 0.5) * DRIFT_ACCEL;

        let proximity = 0;
        let angle = 0;
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
          angle = Math.atan2(dy, dx);
          proximity = smoothstep(INTERACTION_RADIUS, INNER_RADIUS, dist);

          if (proximity > 0) {
            // Tangential force so lit particles swirl around the cursor
            // instead of fleeing it; foreground (larger/closer-depth)
            // particles respond more eagerly than background ones, which
            // is what actually sells the sense of depth while swirling.
            const nx = dx / dist;
            const ny = dy / dist;
            const tangentX = -ny;
            const tangentY = nx;
            const depthFactor = 0.55 + p.depth * 0.75;
            p.vx += tangentX * SWIRL_STRENGTH * proximity * depthFactor;
            p.vy += tangentY * SWIRL_STRENGTH * proximity * depthFactor;
            p.vx -= nx * PULL_STRENGTH * proximity;
            p.vy -= ny * PULL_STRENGTH * proximity;
          }
        }

        p.vx *= DAMPING;
        p.vy *= DAMPING;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const capSpeed = MAX_DRIFT_SPEED * (1 + proximity * 6);
        if (speed > capSpeed) {
          p.vx = (p.vx / speed) * capSpeed;
          p.vy = (p.vy / speed) * capSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges so the field is a continuous, endless drift.
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Color flows around the swirl (by angle from the cursor) and
        // drifts slowly over time — a living gradient rather than a
        // fixed palette, always within one cohesive hue family.
        const norm = (angle + Math.PI) / (Math.PI * 2);
        const hue = mod360(baseHue + norm * hueRange + hueDrift);
        const lightness = LIGHTNESS_BASE + proximity * (LIGHTNESS_MAX - LIGHTNESS_BASE);
        const alpha = BASE_ALPHA + proximity * (MAX_ALPHA - BASE_ALPHA);
        const radius = p.radius + proximity * MAX_RADIUS_BONUS;

        if (proximity > 0.04) {
          const travelled = Math.hypot(p.x - p.prevX, p.y - p.prevY);
          if (travelled > 0.4) {
            ctx.beginPath();
            ctx.moveTo(p.prevX, p.prevY);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = `hsla(${hue}, ${SATURATION}%, ${lightness}%, ${alpha * 0.45})`;
            ctx.lineWidth = Math.max(0.6, radius * 0.65);
            ctx.lineCap = "round";
            ctx.stroke();
          }

          // Soft outer bloom…
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, ${SATURATION}%, ${lightness}%, ${alpha * 0.1})`;
          ctx.fill();

          // …then a crisp glowing core on top.
          ctx.save();
          ctx.shadowColor = `hsla(${hue}, ${SATURATION}%, ${lightness}%, ${Math.min(1, proximity)})`;
          ctx.shadowBlur = 9 * proximity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, ${SATURATION}%, ${lightness}%, ${alpha})`;
          ctx.fill();
          ctx.restore();

          lit.push({ p, proximity, hue });
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, ${SATURATION}%, ${lightness}%, ${alpha})`;
          ctx.fill();
        }
      }

      // Constellation lines — only between particles that are both
      // currently lit, blending their two hues, so the network dissolves
      // with the spotlight instead of cluttering the whole screen.
      for (let i = 0; i < lit.length; i++) {
        for (let j = i + 1; j < lit.length; j++) {
          const a = lit[i];
          const b = lit[j];
          const dx = a.p.x - b.p.x;
          const dy = a.p.y - b.p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINE_DISTANCE) {
            const lineAlpha =
              (1 - dist / LINE_DISTANCE) * Math.min(a.proximity, b.proximity) * 0.5;
            const lineHue = (a.hue + b.hue) / 2;
            ctx.beginPath();
            ctx.moveTo(a.p.x, a.p.y);
            ctx.lineTo(b.p.x, b.p.y);
            ctx.strokeStyle = `hsla(${lineHue}, ${SATURATION}%, 58%, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      if (noisePattern) {
        ctx.fillStyle = noisePattern;
        ctx.fillRect(0, 0, width, height);
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      renderFrame();
    };

    if (prefersReducedMotion) {
      // One calm static frame, no continuous motion or cursor tracking.
      ctx.fillStyle = `rgb(${backgroundColor})`;
      ctx.fillRect(0, 0, width, height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${baseHue}, ${SATURATION}%, 55%, 0.12)`;
        ctx.fill();
      }
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", buildParticles);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [baseHue, hueRange, backgroundColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};

export default SpotlightField;