import { NextRequest, NextResponse } from "next/server";
import dbconnect from "@/lib/mongodb";
import UserModel from "@/models/user_model";
import bcrypt from "bcryptjs";
import { decrypt } from "@/lib/jose_auth";

export async function POST(req: NextRequest){
    try{
        await dbconnect();
        const { password } = await req.json();

        if(!password){
            return NextResponse.json({message:"New password is required"},{status:400})
        }

        const resetCookie = req.cookies.get("resetPassword")?.value;
        if (!resetCookie) {
            return NextResponse.json({message: "Unauthorized or session expired. Please verify your OTP again."}, {status: 401});
        }

        const payload = await decrypt(resetCookie);
        if (!payload || !payload.userId) {
            return NextResponse.json({message: "Invalid session. Please verify your OTP again."}, {status: 401});
        }

        const user = await UserModel.findById(payload.userId);
        if(!user){
            return NextResponse.json({message: "User not found"}, {status: 400});
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();
        
        const response = NextResponse.json({message: "Password reset successful. Continue to login with new password"}, {status: 201});
        response.cookies.set("resetPassword", "", { path: "/", maxAge: 0 });
        return response;
    }
    catch(error: unknown){
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}