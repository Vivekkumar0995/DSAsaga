"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import GradientButton from "@/components/ui/GradientButton";
import CodeAnimation from "./CodeAnimation";
import SpotlightField from "./SpotlightField";

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
      <SpotlightField />

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
              <GradientButton label="Get Started" />
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
