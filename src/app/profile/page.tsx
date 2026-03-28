"use client"

import Navbar from "@/components/Navbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import Sidebar from "@/components/Sidebar";

const profile = () => {
  return (
    <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="pt-28 px-4 md:px-6">
          <div className="mx-auto flex max-w-400 items-start gap-6">
            <Sidebar />
            <div className="flex-1 min-w-0">
              <ProfileHeader />
            </div>
          </div>
        </div>
    </div>
  )
}

export default profile;