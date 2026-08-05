"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Level {
  icon: string;
  title: string;
  stage: string;
  xp: number;
  stars: number;
  desc: string;
  topics: string[];
  slug: string;
  boss?: boolean;
}

const LEVELS: Level[] = [
  {
    icon: "🧱",
    title: "Array",
    stage: "Level 01",
    xp: 100,
    stars: 2,
    slug: "array",
    desc: "The foundation of every data structure: a fixed-size, contiguous block of memory that gives you O(1) random access.",
    topics: ["Static vs dynamic arrays", "Indexing & memory layout", "Two-pointer technique", "Sliding window basics"],
  },
  {
    icon: "🔤",
    title: "String",
    stage: "Level 02",
    xp: 120,
    stars: 2,
    slug: "string",
    desc: "Character arrays with their own rulebook — immutability, pattern matching, and encoding quirks.",
    topics: ["String traversal & mutation", "Pattern matching (KMP, Z-algo)", "Anagrams & palindromes", "Common built-in methods"],
  },
  {
    icon: "🔗",
    title: "Linked List",
    stage: "Level 03",
    xp: 140,
    stars: 3,
    slug: "linked-list",
    desc: "Nodes connected by pointers instead of index math. Learn to think in references, not offsets.",
    topics: ["Singly vs doubly linked", "Reversal & cycle detection", "Fast & slow pointers", "Merge & sort variants"],
  },
  {
    icon: "📥",
    title: "Stack",
    stage: "Level 04",
    xp: 130,
    stars: 2,
    slug: "stack",
    desc: "Last in, first out. The structure quietly powering recursion, undo history, and expression parsing.",
    topics: ["Push / pop / peek", "Call stack & recursion", "Valid parentheses problems", "Monotonic stacks"],
  },
  {
    icon: "📤",
    title: "Queue",
    stage: "Level 05",
    xp: 130,
    stars: 2,
    slug: "queue",
    desc: "First in, first out. Essential for scheduling, buffering, and breadth-first traversal.",
    topics: ["Enqueue / dequeue", "Circular queues", "Deques & priority queues", "BFS scheduling patterns"],
  },
  {
    icon: "🗂️",
    title: "Hash Table",
    stage: "Level 06",
    xp: 160,
    stars: 3,
    slug: "hash-table",
    desc: "Trade memory for speed. Master the mechanics behind near-instant key-value lookups.",
    topics: ["Hash functions & collisions", "Chaining vs open addressing", "Load factor & resizing", "Set & map problem patterns"],
  },
  {
    icon: "🌳",
    title: "Tree",
    stage: "Level 07",
    xp: 180,
    stars: 4,
    slug: "tree",
    desc: "Hierarchies, not lines. Binary search trees, heaps, and balanced trees all branch from here.",
    topics: ["Binary trees & BSTs", "Traversals (in/pre/post-order)", "Heaps & priority structures", "Balanced trees (AVL, Red-Black)"],
  },
  {
    icon: "🕸️",
    title: "Graph",
    stage: "Level 08",
    xp: 200,
    stars: 4,
    slug: "graph",
    desc: "Networks of nodes and edges. The structure behind maps, social networks, and dependency chains.",
    topics: ["Adjacency list vs matrix", "BFS & DFS traversal", "Shortest paths (Dijkstra)", "Topological sort & cycles"],
  },
  {
    icon: "🧮",
    title: "Sorting & Searching",
    stage: "Level 09",
    xp: 190,
    stars: 3,
    slug: "sorting-searching",
    desc: "The algorithms that put order into chaos, and the search techniques that exploit that order.",
    topics: ["Merge sort & quicksort", "Binary search variants", "Time/space trade-offs", "Stability & in-place sorting"],
  },
  {
    icon: "👑",
    title: "Dynamic Programming",
    stage: "BOSS LEVEL",
    xp: 300,
    stars: 5,
    slug: "dynamic-programming",
    desc: "The final boss. Break problems into overlapping subproblems and never recompute the same answer twice.",
    topics: ["Memoization vs tabulation", "Classic DP patterns (knapsack, LIS)", "State design", "Optimizing space complexity"],
    boss: true,
  },
];

export default function LevelMap() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [activeLevelIdx, setActiveLevelIdx] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load completed state from localStorage on client side mount
  useEffect(() => {
    const saved = localStorage.getItem("dsasaga_completed_levels");
    if (saved) {
      try {
        setCompleted(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse completed levels", e);
      }
    }
  }, []);

  const saveCompleted = (updated: number[]) => {
    setCompleted(updated);
    localStorage.setItem("dsasaga_completed_levels", JSON.stringify(updated));
  };

  const levelStatus = (i: number) => {
    if (completed.includes(i)) return "completed";
    const unlocked = i === 0 || completed.includes(i - 1);
    if (!unlocked) return "locked";
    return "unlocked";
  };

  const drawPath = () => {
    const container = containerRef.current;
    if (!container) return;

    const svg = container.querySelector("#pathSvg") as SVGSVGElement | null;
    const mapWrap = container.querySelector("#mapWrap") as HTMLDivElement | null;
    if (!svg || !mapWrap) return;

    const wrapRect = mapWrap.getBoundingClientRect();
    svg.setAttribute("width", String(wrapRect.width));
    svg.setAttribute("height", String(mapWrap.scrollHeight));
    svg.setAttribute("viewBox", `0 0 ${wrapRect.width} ${mapWrap.scrollHeight}`);

    const points: [number, number][] = [];
    const levelElements = container.querySelectorAll(".level");
    levelElements.forEach((el) => {
      const r = el.getBoundingClientRect();
      const x = r.left - wrapRect.left + r.width / 2;
      const y = r.top - wrapRect.top + r.height / 2 + mapWrap.scrollTop;
      points.push([x, y]);
    });

    if (points.length < 2) return;

    let d = `M ${points[0]?.[0]} ${points[0]?.[1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      if (p0 && p1) {
        const [x0, y0] = p0;
        const [x1, y1] = p1;
        const midY = (y0 + y1) / 2;
        d += ` C ${x0} ${midY}, ${x1} ${midY}, ${x1} ${y1}`;
      }
    }

    const trackLine = container.querySelector("#trackLine");
    const trackDashes = container.querySelector("#trackDashes");
    const trackGlow = container.querySelector("#trackGlow");

    trackLine?.setAttribute("d", d);
    trackDashes?.setAttribute("d", d);
    trackGlow?.setAttribute("d", d);
  };

  // Re-draw path on mount, completed change, or screen resize
  useEffect(() => {
    const handleResize = () => {
      drawPath();
    };

    const timer = setTimeout(() => {
      drawPath();
    }, 150);

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [completed]);

  const onLevelClick = (i: number) => {
    const status = levelStatus(i);
    if (status === "locked") {
      shakeNode(i);
      return;
    }
    setActiveLevelIdx(i);
    setIsDrawerOpen(true);
  };

  const shakeNode = (i: number) => {
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector(`.level[data-index="${i}"]`) as HTMLElement | null;
    if (!el) return;
    el.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(-4px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 320, easing: "ease-in-out" }
    );
  };

  const burstConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset sizes
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981"];
    const particles = Array.from({ length: 90 }).map(() => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * -9 - 3,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)] || "#0ea5e9",
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 12,
      life: 0,
    }));

    const tick = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.vy += 0.28;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life++;
        if (p.life < 90) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, 1 - p.life / 90);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });
      if (alive) {
        requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    tick();
  };

  const handleMarkComplete = () => {
    if (activeLevelIdx === null) return;
    if (completed.includes(activeLevelIdx)) return;

    const newCompleted = [...completed, activeLevelIdx];
    saveCompleted(newCompleted);
    burstConfetti();

    setTimeout(() => {
      setIsDrawerOpen(false);
    }, 1000);
  };

  const activeLevel = activeLevelIdx !== null ? LEVELS[activeLevelIdx] : null;

  return (
    <section ref={containerRef} className="level-map-container relative w-full overflow-hidden top-5">
      <div className="bg-grid"></div>

      <header>
        <div>
          <div className="brand">
            <svg className="brand-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>DEVPATH // LEVEL MAP</span>
          </div>
          <h1>
            Data Structures <span>Quest</span>
          </h1>
          <p className="subhead">
            Clear each checkpoint to unlock the next. Ten levels stand between you and the Dynamic Programming boss.
          </p>
        </div>
        <div className="progress-wrap">
          <div className="progress-label">
            <span>PROGRESS</span>
            <span>
              <b id="progressCount">{completed.length}</b>/10 CLEARED
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(completed.length / LEVELS.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      <div className="map-wrap" id="mapWrap">
        <svg className="path-svg" id="pathSvg">
          <defs>
            <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0ea5e9" stopOpacity="0" />
              <stop offset="0.5" stopColor="#0ea5e9" stopOpacity="1" />
              <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="track-line" id="trackLine" d=""></path>
          <path className="track-dashes" id="trackDashes" d=""></path>
          <path className="track-glow" id="trackGlow" d=""></path>
        </svg>

        <div className="nodes">
          {LEVELS.map((lvl, i) => {
            const status = levelStatus(i);
            const isCurrent =
              (i === 0 && completed.length === 0) ||
              (completed.includes(i - 1) && !completed.includes(i));

            let statusBadge = null;
            let levelClass = "";

            if (status === "locked") {
              levelClass = "locked";
              statusBadge = <div className="lock-badge">🔒</div>;
            } else if (status === "completed") {
              levelClass = "completed";
              statusBadge = <div className="check-badge">✓</div>;
            } else {
              levelClass = isCurrent ? "current" : "unlocked";
              statusBadge = <div className="status-badge"></div>;
            }

            if (lvl.boss) {
              levelClass += " boss";
            }

            return (
              <div
                key={lvl.title}
                className={`node-row ${i % 2 === 0 ? "left" : "right"}`}
              >
                <div
                  className={`level ${levelClass}`}
                  data-index={i}
                  onClick={() => onLevelClick(i)}
                >
                  <div className="ring"></div>
                  <div className="hex"></div>
                  {lvl.boss && <div className="level-inner-glow"></div>}
                  <span className="icon">{lvl.icon}</span>
                  <div className="num-badge">{String(i + 1).padStart(2, "0")}</div>
                  {statusBadge}
                </div>
                <div className={`card-copy ${status === "locked" ? "dim" : ""}`}>
                  <div className="stage">{lvl.stage}</div>
                  <h3>{lvl.title}</h3>
                  <p>
                    {lvl.desc.slice(0, 70)}
                    {lvl.desc.length > 70 ? "…" : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`overlay ${isDrawerOpen ? "show" : ""}`}
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      <div className={`drawer ${isDrawerOpen ? "show" : ""}`}>
        <div className="drawer-close" onClick={() => setIsDrawerOpen(false)}>
          ✕
        </div>
        {activeLevel && (
          <>
            <div className="drawer-icon">{activeLevel.icon}</div>
            <div className="stage">{activeLevel.stage}</div>
            <h2>{activeLevel.title}</h2>
            <p className="desc">{activeLevel.desc}</p>
            <div className="meta-row">
              <div className="meta-item">
                <div className="k">Difficulty</div>
                <div className="v stars">
                  {"★★★★★".slice(0, activeLevel.stars) +
                    "☆☆☆☆☆".slice(0, 5 - activeLevel.stars)}
                </div>
              </div>
              <div className="meta-item">
                <div className="k">XP Reward</div>
                <div className="v">{activeLevel.xp} XP</div>
              </div>
            </div>
            <ul className="topics">
              {activeLevel.topics.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>

            <div className="space-y-3">
              <Link href={`/${activeLevel.slug}`} onClick={() => setIsDrawerOpen(false)}>
                <button
                  className="drawer-btn flex items-center justify-center gap-2 mb-3"
                  style={{
                    background: "linear-gradient(90deg, var(--cyan), var(--violet))",
                    color: "#ffffff",
                  }}
                >
                  ⚔️ Enter Arena & Learn
                </button>
              </Link>

              <button
                className={`drawer-btn ${completed.includes(activeLevelIdx || 0) ? "done" : ""}`}
                onClick={handleMarkComplete}
                disabled={completed.includes(activeLevelIdx || 0)}
              >
                {completed.includes(activeLevelIdx || 0) ? "✓ Level Complete" : "Mark Level Complete"}
              </button>
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} id="confetti"></canvas>

      <footer>ROADMAP.EXE — click an unlocked level to view details & enter challenges — progress saved automatically</footer>

      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

          .level-map-container {
            --bg-0:#eef1f6;
            --bg-1:#ffffff;
            --panel:#ffffff;
            --panel-2:#f1f5f9;
            --line:#cbd5e1;
            --cyan:#0ea5e9;
            --violet:#8b5cf6;
            --amber:#f59e0b;
            --green:#10b981;
            --red:#ef4444;
            --text:#0f172a;
            --text-dim:#64748b;
            --locked:#94a3b8;

            background:
              radial-gradient(ellipse 900px 500px at 15% -5%, rgba(139,92,246,0.08), transparent 60%),
              radial-gradient(ellipse 900px 600px at 85% 10%, rgba(14,165,233,0.08), transparent 55%),
              var(--bg-0);
            color:var(--text);
            font-family:'Space Grotesk', sans-serif;
            overflow:hidden;
            min-height:100%;
            padding-bottom: 80px;
          }

          .level-map-container .bg-grid{
            position:absolute; inset:0; z-index:0; pointer-events:none; opacity:0.35;
            background-image:
              linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px);
            background-size:42px 42px;
            mask-image:radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent 90%);
          }

          .level-map-container header{
            position:relative; z-index:2;
            padding:120px 6vw 18px;
            display:flex; align-items:center; justify-content:space-between; gap:24px;
            flex-wrap:wrap;
          }
          .level-map-container .brand{
            display:flex; align-items:center; gap:12px;
            font-family:'Rajdhani',sans-serif; font-weight:700; letter-spacing:2px;
            font-size:15px; color:var(--text-dim); text-transform:uppercase;
          }
          .level-map-container .brand-logo {
            width: 22px;
            height: 22px;
            stroke: var(--cyan);
            filter: drop-shadow(0 0 6px rgba(14,165,233,0.6));
            animation: floatBrandLogo 4.2s ease-in-out infinite;
          }
          @keyframes floatBrandLogo {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-4px) rotate(180deg); }
          }

          .level-map-container h1{
            font-family:'Rajdhani',sans-serif; font-weight:700;
            font-size:clamp(28px, 4.4vw, 52px);
            line-height:1.05; letter-spacing:0.5px;
            margin: 8px 0 0;
            color: var(--text);
          }
          .level-map-container h1 span{
            background: linear-gradient(90deg, var(--cyan), var(--violet), var(--cyan));
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: shineGradient 4.5s linear infinite;
          }
          @keyframes shineGradient {
            to { background-position: 200% center; }
          }
          .level-map-container .subhead{color:var(--text-dim); font-size:15px; max-width:520px; margin-top:8px;}

          .level-map-container .progress-wrap{
            min-width:220px; flex:0 0 auto;
          }
          .level-map-container .progress-label{
            display:flex; justify-content:space-between; font-family:'JetBrains Mono',monospace;
            font-size:12px; color:var(--text-dim); margin-bottom:6px; letter-spacing:0.5px;
          }
          .level-map-container .progress-label b{color:var(--cyan); font-weight:700;}
          .level-map-container .progress-track{
            width:220px; height:10px; border-radius:6px; background:var(--bg-1);
            border:1px solid var(--line); overflow:hidden; position:relative;
          }
          .level-map-container .progress-fill{
            height:100%; width:0%; border-radius:6px;
            background:linear-gradient(90deg, var(--cyan), var(--violet));
            box-shadow:0 0 12px rgba(14,165,233,0.4);
            transition:width .7s cubic-bezier(.22,1,.36,1);
          }

          .level-map-container .map-wrap{
            position:relative; z-index:1;
            max-width:1180px; margin:20px auto 0; padding:40px 5vw 120px;
          }
          .level-map-container svg.path-svg{
            position:absolute; top:0; left:0; width:100%; height:100%; z-index:0;
            overflow:visible; pointer-events:none;
          }
          .level-map-container .track-line{
            fill:none; stroke:var(--line); stroke-width:14; stroke-linecap:round;
          }
          .level-map-container .track-dashes{
            fill:none; stroke:#94a3b8; stroke-width:2.5; stroke-linecap:round;
            stroke-dasharray:2 16;
          }
          .level-map-container .track-glow{
            fill:none; stroke:url(#flowGrad); stroke-width:4; stroke-linecap:round;
            stroke-dasharray:40 900; filter:drop-shadow(0 0 6px rgba(14,165,233,0.8));
            animation:flow 5s linear infinite;
          }
          @keyframes flow{ to { stroke-dashoffset:-940; } }

          .level-map-container .nodes{
            position:relative; z-index:2;
            display:flex; flex-direction:column; gap:64px;
          }
          .level-map-container .node-row{
            display:flex; align-items:center; gap:28px;
            width:100%;
          }
          .level-map-container .node-row.right{ justify-content:flex-end; }
          .level-map-container .node-row.left{ justify-content:flex-start; }

          .level-map-container .level{
            position:relative;
            width:112px; height:112px; flex:0 0 auto;
            display:flex; align-items:center; justify-content:center;
            cursor:pointer; -webkit-tap-highlight-color:transparent;
            transition:transform .25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .level-map-container .level:hover{ transform:translateY(-5px) scale(1.06); }
          .level-map-container .level:active{ transform:translateY(-1px) scale(0.98); }

          .level-map-container .hex{
            position:absolute; inset:0;
            clip-path:polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%);
            background:linear-gradient(160deg, var(--panel-2), var(--panel));
            border:2px solid var(--line);
            transition:all .3s ease;
          }
          .level-map-container .level .ring{
            position:absolute; inset:-8px; border-radius:50%;
            border:1px solid transparent;
          }
          .level-map-container .level.unlocked .hex{ border-color:var(--cyan); box-shadow:0 0 0 1px rgba(14,165,233,0.1), 0 0 26px rgba(14,165,233,0.2), inset 0 0 20px rgba(14,165,233,0.04);}
          .level-map-container .level.unlocked .ring{ animation:pulseRing 2.4s ease-out infinite; border-color:var(--cyan); }
          @keyframes pulseRing{
            0%{ transform:scale(0.9); opacity:.7; }
            100%{ transform:scale(1.35); opacity:0; }
          }
          .level-map-container .level.completed .hex{ border-color:var(--green); box-shadow:0 0 0 1px rgba(16,185,129,0.15), 0 0 24px rgba(16,185,129,0.25); background:linear-gradient(160deg, #ecfdf5, #ffffff);}
          .level-map-container .level.locked .hex{ filter:grayscale(1); opacity:0.55; }
          .level-map-container .level.locked{ cursor:not-allowed; }
          .level-map-container .level.current .hex{ border-color:var(--amber); box-shadow:0 0 0 1px rgba(245,158,11,0.15), 0 0 30px rgba(245,158,11,0.3);}
          .level-map-container .level.current .ring{ border-color:var(--amber); animation:pulseRing 1.6s ease-out infinite; }

          .level-map-container .icon{ font-size:34px; z-index:1; filter:drop-shadow(0 2px 6px rgba(0,0,0,0.15)); transition: transform 0.3s ease; }
          .level-map-container .level.current .icon {
            animation: floatIcon 2.4s ease-in-out infinite;
          }
          @keyframes floatIcon {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.14) translateY(-2px); }
          }

          .level-map-container .lock-badge{
            position:absolute; bottom:-6px; right:-2px; width:26px; height:26px; border-radius:50%;
            background:var(--bg-1); border:2px solid var(--line); display:flex; align-items:center; justify-content:center;
            font-size:12px; color:var(--text-dim); z-index:2;
          }
          .level-map-container .check-badge{
            position:absolute; bottom:-6px; right:-2px; width:26px; height:26px; border-radius:50%;
            background:var(--green); border:2px solid var(--bg-1); display:flex; align-items:center; justify-content:center;
            font-size:13px; color:#ffffff; font-weight:700; z-index:2;
          }
          .level-map-container .num-badge{
            position:absolute; top:-8px; left:-8px; width:26px; height:26px; border-radius:50%;
            background:var(--bg-1); border:2px solid var(--line); display:flex; align-items:center; justify-content:center;
            font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--text-dim); z-index:2;
          }

          .level-map-container .card-copy{ max-width:280px; }
          .level-map-container .node-row.right .card-copy{ text-align:right; }
          .level-map-container .card-copy .stage{
            font-family:'JetBrains Mono',monospace; font-size:11px; letter-spacing:1.5px; color:var(--cyan); text-transform:uppercase;
            font-weight: 600;
          }
          .level-map-container .card-copy h3{ font-family:'Rajdhani',sans-serif; font-size:22px; font-weight:700; margin:2px 0 4px; color: var(--text); transition: all 0.3s ease; }

          /* Interactive Title Gradients on Hover */
          .level-map-container .node-row:hover h3 {
            background: linear-gradient(90deg, var(--cyan), var(--violet));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            transform: translateX(4px);
          }
          .level-map-container .node-row.right:hover h3 {
            transform: translateX(-4px);
          }

          .level-map-container .card-copy p{ color:var(--text-dim); font-size:13.5px; line-height:1.4; }
          .level-map-container .level.locked ~ .card-copy, .level-map-container .card-copy.dim{ opacity:0.45; }

          .level-map-container .boss .hex{ background:linear-gradient(160deg, #faf5ff, #ffffff); }
          .level-map-container .boss .level-inner-glow{ position:absolute; inset:14px; border-radius:50%; background:radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%); }

          .level-map-container .overlay{
            position:fixed; inset:0; background:rgba(15,23,42,0.3); backdrop-filter:blur(2px);
            opacity:0; pointer-events:none; transition:opacity .3s ease; z-index:99990;
          }
          .level-map-container .overlay.show{ opacity:1; pointer-events:auto; }

          .level-map-container .drawer{
            position:fixed; top:0; right:0; height:100%; width:min(420px, 92vw);
            background:linear-gradient(180deg, var(--panel-2), var(--panel));
            border-left:1px solid var(--line);
            transform:translateX(100%); transition:transform .38s cubic-bezier(.22,1,.36,1);
            z-index:99999; padding:28px 26px; overflow-y:auto;
            color: var(--text);
            box-shadow: -10px 0 30px rgba(0,0,0,0.05);
          }
          .level-map-container .drawer.show{ transform:translateX(0); }

          /* Modern Sequential Fade-in Slide-up animation for Drawer contents */
          .level-map-container .drawer.show > * {
            animation: fadeInUp 0.4s ease forwards;
            opacity: 0;
          }
          .level-map-container .drawer.show .drawer-close { animation: none; opacity: 1; }
          .level-map-container .drawer.show .drawer-icon { animation-delay: 0.08s; }
          .level-map-container .drawer.show .stage { animation-delay: 0.12s; }
          .level-map-container .drawer.show h2 { animation-delay: 0.16s; }
          .level-map-container .drawer.show .desc { animation-delay: 0.2s; }
          .level-map-container .drawer.show .meta-row { animation-delay: 0.24s; }
          .level-map-container .drawer.show .topics { animation-delay: 0.28s; }
          .level-map-container .drawer.show .space-y-3 { animation-delay: 0.32s; }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .level-map-container .drawer-close{
            position:absolute; top:20px; right:20px; width:34px; height:34px; border-radius:50%;
            border:1px solid var(--line); background:var(--panel); color:var(--text-dim);
            display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px;
          }
          .level-map-container .drawer-close:hover{ color:var(--text); border-color:var(--cyan); }
          .level-map-container .drawer-icon{
            width:70px; height:70px; border-radius:18px; display:flex; align-items:center; justify-content:center;
            font-size:36px; background:var(--panel-2); border:1px solid var(--line); margin-bottom:18px;
          }
          .level-map-container .drawer .stage{ font-family:'JetBrains Mono',monospace; font-size:12px; color:var(--cyan); letter-spacing:1.5px; text-transform:uppercase; font-weight: 600; }
          .level-map-container .drawer h2{ font-family:'Rajdhani',sans-serif; font-size:30px; margin:4px 0 12px; color: var(--text); }
          .level-map-container .drawer .desc{ color:var(--text-dim); font-size:14.5px; line-height:1.6; margin-bottom:20px; }
          .level-map-container .meta-row{ display:flex; gap:22px; margin-bottom:22px; flex-wrap:wrap; }
          .level-map-container .meta-item .k{ font-family:'JetBrains Mono',monospace; font-size:10.5px; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px; }
          .level-map-container .meta-item .v{ font-family:'Rajdhani',sans-serif; font-weight:700; font-size:16px; margin-top:2px; color: var(--text); }
          .level-map-container .stars{ color:var(--amber); letter-spacing:2px; }
          .level-map-container .topics{ list-style:none; margin-bottom:26px; }
          .level-map-container .topics li{
            padding:9px 0; border-bottom:1px dashed var(--line); font-size:13.5px; color:var(--text);
            display:flex; align-items:center; gap:10px;
          }
          .level-map-container .topics li::before{ content:"▹"; color:var(--violet); }
          .level-map-container .drawer-btn{
            width:100%; padding:14px; border-radius:10px; border:none; cursor:pointer;
            font-family:'Rajdhani',sans-serif; font-weight:700; font-size:16px; letter-spacing:0.5px;
            background:linear-gradient(90deg, var(--cyan), var(--violet)); color:#ffffff;
            transition:transform .15s ease, box-shadow .15s ease;
          }
          .level-map-container .drawer-btn:hover{ transform:translateY(-2px); box-shadow:0 8px 22px rgba(14,165,233,0.2); }
          .level-map-container .drawer-btn:disabled{ background:var(--line); color:var(--text-dim); cursor:not-allowed; transform:none; box-shadow:none;}
          .level-map-container .drawer-btn.done{ background:linear-gradient(90deg, var(--green), #059669); color: #ffffff; }

          .level-map-container canvas#confetti{ position:fixed; inset:0; pointer-events:none; z-index:999999; }

          .level-map-container footer{
            position:relative; z-index:2; text-align:center; padding:26px; color:var(--text-dim);
            font-family:'JetBrains Mono',monospace; font-size:12px; border-top:1px solid var(--line);
            margin-top: 40px;
          }

          @media (max-width:760px){
            .level-map-container .node-row, .level-map-container .node-row.left, .level-map-container .node-row.right{ justify-content:flex-start !important; }
            .level-map-container .card-copy, .level-map-container .node-row.right .card-copy{ text-align:left; max-width:none; }
            .level-map-container .map-wrap{ padding:30px 6vw 100px; }
            .level-map-container .level{ width:88px; height:88px; }
            .level-map-container .icon{ font-size:26px; }
          }
        `
      }} />
    </section>
  );
}
