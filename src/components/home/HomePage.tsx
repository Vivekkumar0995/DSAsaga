"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import CodeAnimation from "./CodeAnimation";

const HomePage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // console.log(rect);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center text-black px-10 pt-24 bg-[#eef1f6] overflow-hidden group"
    >
      {/* Base Grid */}
      <div className="absolute inset-0 [background-image:radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.74),rgba(238,241,246,0)_42%),linear-gradient(rgba(31,41,55,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(31,41,55,0.045)_1px,transparent_1px)] [background-size:100%_100%,48px_48px,48px_48px] [background-position:center,0_0,0_0] z-0 pointer-events-none" />

      {/* Hover Scaled Grid Layer */}
      <div
        suppressHydrationWarning
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          WebkitMaskImage: `radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)`,
          maskImage: `radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 scale-100 group-hover:scale-[1.02] transition-all duration-500 ease-out"
          style={{
            backgroundImage: "linear-gradient(rgba(31,41,55,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(31,41,55,0.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            backgroundPosition: "0 0",
          }}
        />
      </div>

      <div className="max-w-7xl w-full grid md:grid-cols-2 gap-10 items-center relative z-10">

        <div className="space-y-5">
           <p className="text-sm text-gray-500">
             Master Data Structures & Algorithms
          </p>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Unlock Your <br />
            Coding Potential <br />
            with <span className="text-gray-500">DSAsaga</span>
          </h1>

          <p className="text-black max-w-lg">
            Master Data Structures & Algorithms through gamified challenges,
            real-world problems, and interactive learning.
          </p>

          <div className="flex gap-4 items-center">
            <Link href="/play">
              <Button label="Get Started" />
            </Link>
            <Link href="" className="text-sm underline text-black">
              Learn More
            </Link>
          </div>
          </div>

      <div> <CodeAnimation/></div>


      </div>
    </section>
  );
};

export default HomePage;
