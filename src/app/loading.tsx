import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 z-50">
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Outer glowing aura */}
        <div className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-30 animate-pulse"></div>

        {/* Geometric rotating rings */}
        <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-indigo-600 animate-[spin_2s_ease-in-out_infinite]"></div>
        <div className="absolute inset-2 rounded-full border-l-4 border-r-4 border-purple-500 animate-[spin_3s_linear_infinite_reverse]"></div>
        <div className="absolute inset-6 rounded-full border-t-4 border-pink-500 animate-[spin_1.5s_linear_infinite]"></div>

        {/* Code emblem in the center because it's a DSA platform! */}
        <div className="absolute inset-0 flex items-center justify-center">
           <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-pink-600 drop-shadow-sm">
            {`</>`}
           </span>
        </div>
      </div>

      {/* Modern animated typography */}
      <div className="mt-8 flex items-center text-lg font-bold tracking-[0.2em] uppercase text-gray-700">
        LOADING
        <div className="flex gap-1 ml-3 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "-0.3s" }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "-0.15s" }}></span>
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce"></span>
        </div>
      </div>
    </div>
  );
}
