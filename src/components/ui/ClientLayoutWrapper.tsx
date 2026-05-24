"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const allowedTopics = ['array-battle', 'string-battle', 'searching-techniques'];
  const pathParts = pathname.split('/').filter(Boolean);
  const topicIndex = pathParts[0] === 'battles' ? 1 : 0;
  const currentTopic = pathParts[topicIndex] || '';
  const isSidebarVisible = allowedTopics.some(
    topic => currentTopic === topic && (pathParts[0] === 'battles' || pathParts[0] !== 'battles')
  );

  return (
    <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarVisible ? 'ml-64' : ''}`}>
      {children}
    </div>
  );
}
