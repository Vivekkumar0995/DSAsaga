"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export type TopLeaderboardUser = {
  rank: 1 | 2 | 3;
  score: number;
  userId?: {
    name: string;
    profileImage?: string;
  };
};

interface Top3LeaderboardProps {
  topUsers: TopLeaderboardUser[]; 
}

const TypewriterText = ({ strings, typeSpeed = 50, backSpeed = 30, backDelay = 1500 }: { strings: string[], typeSpeed?: number, backSpeed?: number, backDelay?: number }) => {
  const [currentStringIndex, setCurrentStringIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (currentText === "") {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setCurrentStringIndex((prev) => (prev + 1) % strings.length);
        }, 300);
      } else {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, backSpeed);
      }
    } else {
      if (currentText === strings[currentStringIndex]) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, backDelay);
      } else {
        timeout = setTimeout(() => {
          setCurrentText(strings[currentStringIndex].slice(0, currentText.length + 1));
        }, typeSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentStringIndex, strings, typeSpeed, backSpeed, backDelay]);

  return (
    <span className="font-mono text-[11px] sm:text-sm text-slate-900 whitespace-pre-wrap font-bold leading-relaxed">
      {currentText}
      <span className="animate-pulse border-r-2 border-slate-900 ml-[1px]"></span>
    </span>
  );
};

const EXTRA_DATA = {
  1: { color: "#FFD700", lang: "Terminal" },
  2: { color: "#C0C0C0", lang: "Terminal" },
  3: { color: "#CD7F32", lang: "Terminal" }
};

const CubeCard = ({ user, rank, scale }: { user: TopLeaderboardUser; rank: 1 | 2 | 3; scale: number }) => {
  const data = EXTRA_DATA[rank];
  const color = data.color;

  const rotateX = useMotionValue(15);
  const rotateY = useMotionValue(-20);


  const springConfig = { damping: 30, stiffness: 60, mass: 1.2 };
  const smoothX = useSpring(rotateX, springConfig);
  const smoothY = useSpring(rotateY, springConfig);

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef<number>(0);

  useEffect(() => {
    if (!isDragging && !isHovered) {
      let angle = rotateY.get();
      const loop = () => {
        angle += 0.3;
        rotateY.set(angle);
        autoRotateRef.current = requestAnimationFrame(loop);
      };
      autoRotateRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(autoRotateRef.current!);
    }
  }, [isDragging, isHovered, rotateY]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastPos.current.x;
    const deltaY = e.clientY - lastPos.current.y;

    const mult = 0.5;
    rotateY.set(rotateY.get() + deltaX * mult);
    rotateX.set(rotateX.get() - deltaY * mult);

    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);

    rotateX.set(15);


    const currentY = rotateY.get();
    const targetY = Math.round((currentY + 20) / 360) * 360 - 20;
    rotateY.set(targetY);
  };


  const renderRankFace = (faceIndex: number) => {
    const baseColors = ["#adccc7", "#144c52", "#053220", "#d34c26", "#f2e9d0", "#eaceb4", "#e79e85", "#bb5a5a"];

    const getStableRandomColor = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      const index = Math.floor((x - Math.floor(x)) * baseColors.length);
      return baseColors[index];
    };

    const gridColors = Array.from({ length: 64 }).map((_, i) => getStableRandomColor(rank * 1000 + faceIndex * 100 + i));

    const isThisFaceHovered = hoveredFace === faceIndex;

    return (
      <div
        onMouseEnter={() => setHoveredFace(faceIndex)}
        onMouseLeave={() => setHoveredFace(null)}
        className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-2 rounded-lg overflow-hidden transition-all duration-[600ms] ease-in-out border-2 ${isHovered ? "opacity-100" : "border-slate-200/20 opacity-95 shadow-sm"}`}
        style={{
          backfaceVisibility: "hidden",
          borderColor: isHovered ? color : "rgba(255,255,255,0.2)",
          pointerEvents: "auto"
        }}
      >

        <div className={`absolute inset-0 grid grid-cols-8 grid-rows-8 z-0 w-full h-full pointer-events-none transition-transform duration-[600ms] ${isThisFaceHovered ? "scale-125" : "scale-100"}`}>
          {gridColors.map((c, i) => (
            <div key={i} className="w-full h-full border border-black/10" style={{ backgroundColor: c }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 py-4 w-[90%] text-center rounded-xl border transition-all duration-700 backdrop-blur-md shadow-2xl bg-slate-900/95 border-white/20">
          <span
            key={isThisFaceHovered ? 'hovered' : 'unhovered'}
            className={`font-mono font-black text-6xl sm:text-8xl transition-colors duration-300 ${isThisFaceHovered ? "text-yellow-400 animate-pulse" : "text-white"}`}
            style={{
              ...(isThisFaceHovered ? { animationIterationCount: 3, animationDuration: "400ms" } : {})
            }}
          >
            {rank}
          </span>
          <span className="font-mono text-white text-lg sm:text-xl mt-2 font-bold w-full break-words whitespace-normal leading-tight">
            {user.userId?.name || "Anonymous"}
          </span>
          <span className="font-mono text-sm sm:text-base mt-2 font-bold transition-all duration-500" style={{ color: color }}>
            Score: {user.score.toLocaleString()}
          </span>
        </div>
      </div>
    );
  };

  const renderCodeFace = () => (
    <div
      className={`absolute inset-0 w-full h-full bg-[#fb923c] shadow-inner flex flex-col rounded-lg overflow-hidden transition-all duration-[600ms] ease-in-out border-2 ${isHovered ? "opacity-100" : "border-orange-400/50 opacity-95"}`}
      style={{
        backfaceVisibility: "hidden",
        borderColor: isHovered ? color : "rgba(251, 146, 60, 0.5)"
      }}
    >
      <div className="w-full h-8 sm:h-10 bg-black/10 border-b border-black/10 flex items-center px-4 relative shrink-0 z-10">
        {/* Apple style traffic lights */}
        <div className="flex gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="absolute right-4 font-mono font-bold text-slate-800 text-sm sm:text-base tracking-widest">
          DSASaga
        </span>
      </div>
      <div className="flex-1 p-3 sm:p-4 overflow-hidden pointer-events-none flex flex-col gap-2 relative z-10">
        <TypewriterText strings={[
          `Name: ${user.userId?.name || "Anonymous"}\nRank: #${rank}\nProblems Solved: ${user.score.toLocaleString()}`
        ]} typeSpeed={60} backSpeed={30} backDelay={2000} />
      </div>
    </div>
  );

  const CUBE_SIZE = "w-40 h-40 sm:w-56 sm:h-56";
  const Z_DIST_CLASSES = "[--z-dist:80px] sm:[--z-dist:112px]";

  return (
    <div
      className="flex flex-col items-center group relative perspective-[1200px]"
      style={{ transform: `scale(${scale})`, zIndex: rank === 1 ? 20 : 10 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`${CUBE_SIZE} ${Z_DIST_CLASSES} relative cursor-grab active:cursor-grabbing`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          rotateX: smoothX,
          rotateY: smoothY,
          transformStyle: "preserve-3d"
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div className={`absolute inset-0 flex justify-center items-center`} style={{ backfaceVisibility: "hidden", transform: `translateZ(var(--z-dist))` }}>
          {renderRankFace(0)}
        </div>
        <div className={`absolute inset-0 flex justify-center items-center`} style={{ backfaceVisibility: "hidden", transform: `rotateY(180deg) translateZ(var(--z-dist))` }}>
          {renderRankFace(1)}
        </div>
        <div className={`absolute inset-0 flex justify-center items-center`} style={{ backfaceVisibility: "hidden", transform: `rotateY(90deg) translateZ(var(--z-dist))` }}>
          {renderCodeFace()}
        </div>
        <div className={`absolute inset-0 flex justify-center items-center`} style={{ backfaceVisibility: "hidden", transform: `rotateY(-90deg) translateZ(var(--z-dist))` }}>
          {renderCodeFace()}
        </div>
        <div className={`absolute inset-0 flex justify-center items-center`} style={{ backfaceVisibility: "hidden", transform: `rotateX(90deg) translateZ(var(--z-dist))` }}>
          {renderRankFace(2)}
        </div>
        <div className={`absolute inset-0 flex justify-center items-center`} style={{ backfaceVisibility: "hidden", transform: `rotateX(-90deg) translateZ(var(--z-dist))` }}>
          {renderRankFace(3)}
        </div>
      </motion.div>
    </div>
  );
};

export const Top3Leaderboard: React.FC<Top3LeaderboardProps> = ({ topUsers }) => {
  const displayOrder: (1 | 2 | 3)[] = [2, 1, 3];

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-2 sm:py-4 overflow-visible">
      <div className="flex flex-col xl:flex-row items-center xl:items-start justify-center gap-y-36 xl:gap-x-12 2xl:gap-x-47 z-10 w-full max-w-7xl px-4 mt-6 xl:mt-12 mb-16 xl:mb-24">
        {displayOrder.map((rank) => {
          const user = topUsers.find((u) => u.rank === rank) || { rank,score: 0,userId:{ name: "Anonymous" } };
          const scale = rank === 1 ? 1.2 : 1.0;

          return (
            <div key={rank} className={`transition-all duration-500 w-full flex justify-center ${rank === 1 ? "mt-0" : "xl:mt-32"}`}>
              <CubeCard
                user={user as TopLeaderboardUser}
                rank={rank}
                scale={scale}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Top3Leaderboard;
