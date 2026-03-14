"use client";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <div className="h-full w-full flex justify-center fixed z-10">
      <nav className="h-14 bg-gray-200/50 backdrop-blur-xs align-middle flex items-center mt-6 mb-6 p-6 gap-10 rounded-full w-11/12 shadow-[10px_10px_15px_-3px_rgba(0,0,0,0.1)] border-none hover:shadow-[10px_10px_15px_-3px_rgba(0,0,0,0.12)] hover:scale-101 transition-transform duration-500 ease-in-out">
        <div className="flex justify-between w-full">
          <Link href="/" className="text-xl">
            DSASaga
          </Link>
          <div className="flex space-x-8">
            <Link href="/" className="text-lg">
              Home
            </Link>
            <Link href="/auth/login" className="text-lg">
              Login
            </Link>
          </div>
        </div>
        <div className="text-lg font-bold">Dark</div>
      </nav>
    </div>
  );
};

export default Navbar;
