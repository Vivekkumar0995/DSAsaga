"use client";

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiCamera,
  FiSettings,
  FiTrendingUp,
  FiTarget,
  FiAward,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const ProfileHeader = () => {
  const bannerImageInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await axios.get("/api/profile");

        if (res.data.data) {
          setUserData(res.data.data);
        }
      } catch (error: any) {
        console.log("Error fetching profile:", error.message);
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, []);

  const handleBannerCameraClick = () => {
    bannerImageInputRef.current?.click();
  };

  const handleBannerImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      input.value = "";
      return;
    }

    const loadingToast = toast.loading("Uploading banner image...");
    setIsUploadingBanner(true);

    try {
      const uploadPayload = new FormData();
      uploadPayload.append("file", file);

      const uploadResponse = await axios.post(
        "/api/image-upload",
        uploadPayload,
      );
      const bannerImageUrl = uploadResponse.data?.url;

      if (!bannerImageUrl) {
        throw new Error("Image URL not returned from upload API");
      }

      await axios.put("/api/profile", { bannerImage: bannerImageUrl });

      setUserData((prev: any) => ({
        ...prev,
        bannerImage: bannerImageUrl,
      }));

      toast.success("Banner image updated!", { id: loadingToast });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update banner image.";
      toast.error(message, { id: loadingToast });
    } finally {
      setIsUploadingBanner(false);
      input.value = "";
    }
  };

  const displayName = userData?.displayName;
  const profileName = userData?.name || userData?.fullName;
  const address = userData?.address || userData?.location;

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }
  return (
    <div className="w-full space-y-6 mb-10">
      <div className="w-full space-y-6">
        {/* PROFILE HEADER */}
        <div className="overflow-hidden rounded-4xl border border-gray-200 bg-white shadow">
          <div
            className="relative h-60"
            style={
              userData?.bannerImage
                ? {
                    backgroundImage: `url(${userData.bannerImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!userData?.bannerImage && (
              <div className="absolute inset-0 bg-[#b9b9b9]" />
            )}
            {!userData?.bannerImage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80">
                <p className="text-5xl sm:text-6xl font-black tracking-wide leading-none">
                  COVER
                </p>
                <p className="mt-1 text-3xl sm:text-4xl font-bold tracking-[0.18em] leading-none">
                  SAFE WORK
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleBannerCameraClick}
              disabled={isUploadingBanner}
              className="absolute top-3 right-3 p-2 rounded-full bg-gray-900 text-white cursor-pointer shadow disabled:opacity-60"
            >
              <FiCamera />
            </button>
            <input
              ref={bannerImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleBannerImageChange}
              className="hidden"
            />

            <div className="absolute -bottom-12 left-6 md:left-8">
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white overflow-hidden bg-slate-900 shadow-md">
                <Image
                  src={userData?.profileImage || "/images/white.png"}
                  alt="profile"
                  width={115}
                  height={115}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 pb-4 px-6 md:px-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:pl-40">
            <div>
              <p className="inline-flex items-center rounded-full border border-[#b9c8db] bg-[#eff4fa] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#2a4b72] transition duration-300 hover:-translate-y-0.5 hover:bg-[#e8eff8]">
                {displayName}
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-none tracking-tight text-[#1a2a46] transition duration-300 hover:text-[#253a5c]">
                {profileName}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#b9c8db] bg-[#f4f8fc] px-3 py-1.5 text-[#2a4b72] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ecf3fb]">
                  <FiMapPin className="text-base" />
                  <span className="text-base font-semibold leading-none">
                    {address}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-1 md:mt-0">
              <Link
                href="/profile/EditProfile"
                className="rounded-full bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
              >
                Edit Profile
              </Link>
              <Link
                href="/settings"
                className="rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-black"
              >
                + Connect
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                <FiSettings /> Settings
              </Link>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="space-y-6">
            {/* STREAK */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-500 text-sm">Streak</h3>
              <p className="text-3xl font-bold mt-2">🔥 7 Days</p>
            </div>

            {/* DAILY TARGET */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-500 text-sm flex items-center gap-2">
                <FiTarget /> Daily Target
              </h3>

              <div className="mt-3">
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className="bg-black h-2 rounded-full w-[70%]" />
                </div>
                <p className="text-sm mt-2 text-gray-600">7 / 10 completed</p>
              </div>
            </div>

            {/* ACHIEVEMENTS */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-500 text-sm flex items-center gap-2">
                <FiAward /> Achievements
              </h3>
              <ul className="mt-3 text-sm text-gray-600 space-y-2">
                <li>🥇 100 Problems Solved</li>
                <li>🔥 7 Day Streak</li>
                <li>⚔️ First Battle Win</li>
              </ul>
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-2 space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Problems" value="120" icon={<FiTrendingUp />} />
              <StatCard title="Battles" value="45" icon={<FiAward />} />
              <StatCard title="Accuracy" value="82%" icon={<FiTarget />} />
              <StatCard title="Avg Time" value="15m" icon={<FiClock />} />
            </div>

            {/* SIMPLE CHART */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-500 text-sm mb-4">Weekly Activity</h3>

              <div className="flex items-end gap-3 h-32">
                {[40, 60, 30, 80, 50, 70, 90].map((h, i) => (
                  <div
                    key={i}
                    className="bg-black/80 w-6 rounded"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="text-gray-500 text-sm mb-3">Recent Activity</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✅ Solved Two Sum</li>
                <li>⚔️ Won battle vs Alex</li>
                <li>🎯 Completed daily target</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

/* Stat Card */
const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow flex flex-col gap-2">
      <div className="text-gray-400">{icon}</div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-gray-500">{title}</p>
    </div>
  );
};
