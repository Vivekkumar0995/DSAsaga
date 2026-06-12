"use client";

import { usePathname } from "next/navigation";

export default function HideSidebarLayout({sidebar,children,}:{sidebar: React.ReactNode;children: React.ReactNode;}) {

  const pathname = usePathname();

  const hideSidebar = pathname.split("/").length > 3;

  return (
    
    <div className="flex min-h-screen">
      {!hideSidebar && sidebar}
      <div className="flex-1">
        {children}
      </div>

    </div>
  );
}