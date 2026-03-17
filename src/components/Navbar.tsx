"use client";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  return (
    <div className="fixed top-0 left-0 w-full flex justify-center z-10 pointer-events-none">
      <nav className="pointer-events-auto h-14 bg-white/20 backdrop-blur-xs align-middle flex items-center mt-6 mb-6 p-6 gap-10 rounded-full w-11/12 shadow-[10px_10px_15px_-3px_rgba(0,0,0,0.1)]  border border-gray-300/60 hover:shadow-[10px_10px_15px_-3px_rgba(0,0,0,0.12)] hover:scale-101 transition-transform duration-500 ease-in-out">
        <div className="flex justify-between w-full">
          <Link href="/" className="text-xl">
            DSASaga
          </Link>
          <div className="flex space-x-8">
            <Link href="/" className="text-lg">
              Home
            </Link>
            {pathname != "/auth/login" && (
            <Link href="/auth/login" className="text-lg">
              Login
            </Link>
            )}
          </div>
        </div>
        <div className="text-lg font-bold">Dark</div>
      </nav>
    </div>
  );
};

export default Navbar;
