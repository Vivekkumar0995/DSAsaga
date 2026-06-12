import { NextRequest, NextResponse } from "next/server";
import dbconnect from "@/lib/mongodb";
import UserModel from "@/models/user_model";
import { decrypt } from "@/lib/jose_auth";
import { v2 as cloudinary } from "cloudinary";
import UserProgress from "@/models/UserProgress";
import SolvedQuestion from "@/models/SolvedQuestion";
import QuestionModel from "@/models/question_model";

const hasCloudinaryConfig =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const getUserIdFromToken = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const decoded = (await decrypt(token)) as {
      userId: unknown;
    };
    if (typeof decoded.userId === "string") {
      return decoded.userId;
    }

    if (decoded.userId && typeof decoded.userId === "object") {
      const userIdObject = decoded.userId as {
        toHexString?: () => string;
        buffer?: ArrayLike<number>;
      };

      if (typeof userIdObject.toHexString === "function") {
        return userIdObject.toHexString();
      }

      if (userIdObject.buffer) {
        return Buffer.from(Array.from(userIdObject.buffer)).toString("hex");
      }
    }

    return null;
  } catch {
    return null;
  }
};

const getCloudinaryPublicIdFromUrl = (imageUrl: string) => {
  try {
    const parsedUrl = new URL(imageUrl);

    if (parsedUrl.hostname !== "res.cloudinary.com") {
      return null;
    }

    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    const uploadIndex = pathParts.indexOf("upload");

    if (uploadIndex === -1 || uploadIndex === pathParts.length - 1) {
      return null;
    }

    let publicIdParts = pathParts.slice(uploadIndex + 1);

    if (/^v\d+$/.test(publicIdParts[0] ?? "")) {
      publicIdParts = publicIdParts.slice(1);
    }

    if (publicIdParts.length === 0) {
      return null;
    }

    const lastPartIndex = publicIdParts.length - 1;
    publicIdParts[lastPartIndex] = publicIdParts[lastPartIndex].replace(
      /\.[^/.]+$/,
      "",
    );

    return decodeURIComponent(publicIdParts.join("/"));
  } catch {
    return null;
  }
};

export async function PUT(req: NextRequest) {
  try {
    await dbconnect();
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      email,
      password,
      isAccountVerified,
      createdAt,
      updatedAt,
      accountCreated,
      lastLogin,
      lastLoginAt,
      ...updateData
    } = body;

    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const incomingProfileImage =
      typeof updateData.profileImage === "string"
        ? updateData.profileImage
        : null;
    const currentProfileImage =
      typeof existingUser.profileImage === "string"
        ? existingUser.profileImage
        : null;
    const incomingBannerImage =
      typeof updateData.bannerImage === "string"
        ? updateData.bannerImage
        : null;
    const currentBannerImage =
      typeof existingUser.bannerImage === "string"
        ? existingUser.bannerImage
        : null;

    if (
      incomingProfileImage &&
      currentProfileImage &&
      incomingProfileImage !== currentProfileImage &&
      hasCloudinaryConfig
    ) {
      const oldPublicId = getCloudinaryPublicIdFromUrl(currentProfileImage);
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId, {
            resource_type: "image",
          });
        } catch (cloudinaryError: any) {
          console.log(
            "Error deleting old profile image from Cloudinary:",
            cloudinaryError?.message || cloudinaryError,
          );
        }
      }
    }

    if (
      incomingBannerImage &&
      currentBannerImage &&
      incomingBannerImage !== currentBannerImage &&
      hasCloudinaryConfig
    ) {
      const oldBannerPublicId =
        getCloudinaryPublicIdFromUrl(currentBannerImage);
      if (oldBannerPublicId) {
        try {
          await cloudinary.uploader.destroy(oldBannerPublicId, {
            resource_type: "image",
          });
        } catch (cloudinaryError: any) {
          console.log(
            "Error deleting old banner image from Cloudinary:",
            cloudinaryError?.message || cloudinaryError,
          );
        }
      }
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Profile updated successfully!", data: updatedUser },
      { status: 200 },
    );
  } catch (error: any) {
    console.log("Error updating profile:", error.message);
    return NextResponse.json(
      { message: "Error updating profile!" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbconnect();
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.lastLoginAt) {
      user.lastLoginAt = user.createdAt ?? new Date();
      await user.save();
    }

    const progress = await UserProgress.findOne({ userId });

    const recentSolved = await SolvedQuestion.find({ userId, status: "solved" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("questionSlug xpEarned solvedAt");

    const easyCount = await QuestionModel.countDocuments({
      difficulty: "easy",
    });

    const mediumCount = await QuestionModel.countDocuments({
      difficulty: "medium",
    });

    const hardCount = await QuestionModel.countDocuments({
      difficulty: "hard",
    });

    return NextResponse.json(
      {
        data: user,
        progress,
        recentSolved,
        questionStats: {
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error: any) {
    console.log("Error on fetching profile:", error.message);
    return NextResponse.json(
      { message: "Error fetching profile!" },
      { status: 500 },
    );
  }
}
