"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const allowedTopics = ['array-battle', 'string-battle', 'searching-techniques'];
  const isSidebarVisible = allowedTopics.some(
    topic => pathname === `/${topic}` || pathname.startsWith(`/${topic}/`)
  );

  return (
    <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarVisible ? 'ml-64' : ''}`}>
      {children}
    </div>
  );
}
