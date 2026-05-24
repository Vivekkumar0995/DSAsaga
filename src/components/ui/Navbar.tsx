"use client";
import Link from "next/link";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

type AuthUser = {
  userId?: string;
} | null;

type NavbarProps = {
  initialUser: AuthUser;
};

const Navbar = ({ initialUser }: NavbarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<AuthUser>(initialUser);

  React.useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging out...");

    try {
      const response = await axios.post("/api/auth/logout");
      toast.success(response.data.message || "Logged out!", { id: loadingToast });
      setUser(null);
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
    <div className="fixed top-0 left-0 w-full flex justify-center z-9999 pointer-events-none">
      <nav className="pointer-events-auto h-14 bg-white/20 backdrop-blur-xs align-middle flex items-center mt-6 mb-6 p-6 gap-10 rounded-full w-11/12 shadow-[10px_10px_15px_-3px_rgba(0,0,0,0.1)] border border-gray-300/60 hover:shadow-[10px_10px_15px_-3px_rgba(0,0,0,0.12)] hover:scale-101 transition-transform duration-500 ease-in-out">
        <div className="flex justify-between w-full">
          <Link href="/" className="text-xl">
            DSASaga
          </Link>
          <div className="flex space-x-8">
            <Link href="/" className="text-lg">
              Home
            </Link>
            <Link href="/main/profile" className="text-lg">
               Profile
            </Link>
            {!user && pathname !== "/login" && (
              <Link href="/login" className="text-lg">
                Login
              </Link>
            )}
            {user && (
              <button type="button" onClick={handleLogout} className="text-lg cursor-pointer">
                Logout
              </button>
            )}
          </div>
        </div>
        <div className="text-lg font-bold">Dark</div>
      </nav>
    </div>
  );
};

export default Navbar;
