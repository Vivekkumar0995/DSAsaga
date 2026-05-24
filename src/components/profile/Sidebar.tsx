"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {FiTarget,FiBarChart2,FiUsers,FiAward,FiBookOpen,FiUser,FiSettings,FiLogOut,} from "react-icons/fi";
import axios from "axios";
import router from "next/router";
import toast from "react-hot-toast";

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const loadingToast = toast.loading("Logging out...");

      try {
        const response = await axios.post("/api/auth/logout");
        toast.success(response.data.message || "Logged out!", { id: loadingToast });
        router.push("/");
        router.refresh();
      } catch (error: unknown) {
        const errorMessage = axios.isAxiosError(error)
          ? error.response?.data?.message || "Logout failed"
          : "Logout failed";
        toast.error(errorMessage, { id: loadingToast });
      }
    };

  return (
    <div className="sticky top-28 ml-4 h-[calc(100vh-8rem)] w-70 overflow-hidden bg-white/20 backdrop-blur-xs border border-white/40 flex flex-col p-6 rounded-2xl shadow-[0_12px_36px_rgba(15,23,42,0.18)]">

      <div className="min-h-0 flex-1 w-full overflow-y-auto scrollbar-hide">

        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-3 tracking-widest">PLAY</p>

          <div className="space-y-2">
            <SidebarItem href="/daily-target" icon={<FiTarget />} label="Daily Target" pathname={pathname} />
            <SidebarItem href="/battles" icon={<FiBarChart2 />} label="Battles" pathname={pathname} />
            <SidebarItem href="/versus" icon={<FiUsers />} label="Versus" pathname={pathname} />
            <SidebarItem href="/main/leaderboard" icon={<FiAward />} label="Leaderboard" pathname={pathname} />
            <SidebarItem href="/learn-dsa" icon={<FiBookOpen />} label="Learn DSA" pathname={pathname} />
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-3 tracking-widest">YOU</p>

          <div className="space-y-2">
            <SidebarItem href="/main/profile" icon={<FiUser />} label="Profile" pathname={pathname} isProfile />
            <SidebarItem href="/stats" icon={<FiBarChart2 />} label="Stats" pathname={pathname} />
            <SidebarItem href="/settings" icon={<FiSettings />} label="Settings" pathname={pathname} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button onClick={handleLogout} className="flex items-center gap-3 text-red-500 hover:bg-red-50 w-full px-3 py-2 rounded-lg transition cursor-pointer">
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

type Props = {
  icon: React.ReactNode;
  label: string;
  href: string;
  pathname: string;
  isProfile?: boolean;
};

const SidebarItem: React.FC<Props> = ({
  icon,
  label,
  href,
  pathname,
  isProfile = false,
}) => {
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition cursor-pointer
        ${
          isActive
            ? "bg-gray-200 text-gray-900 font-medium"
            : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"
        }
        ${
          isProfile && isActive
            ? "border border-gray-300 bg-gray-100 font-semibold"
            : ""
        }`}
      >
        {icon}
        {label}
      </div>
    </Link>
  );
};
