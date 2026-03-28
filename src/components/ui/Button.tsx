import React from "react";

const Button = ({ label }: { label: string }) => {
  return (
    <button className="bg-[linear-gradient(to_left,_#9ca3af_50%,_#111827_50%)] bg-[length:200%_100%] bg-right hover:bg-left transition-all duration-500 ease-out px-6 py-3 rounded-full font-semibold shadow-lg text-white cursor-pointer">
      {label}
    </button>
  );
};

export default Button;
