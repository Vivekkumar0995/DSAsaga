import { NextRequest, NextResponse } from "next/server";
import dbconnect from "@/lib/mongodb";
import UserModel from "@/models/user_model";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest){
    try{
        await dbconnect();
        const {email, password} = await req.json();

        if(!email || !password){
            return NextResponse.json({message:"email and password Required"},{status:400})
        }

        const user = await UserModel.findOne({email});
        if(!user){
            return NextResponse.json({message: "Invalid Credentials"}, {status: 400});
        }

        if(user.resetOtpVerifiedTill < Date.now()){
            return NextResponse.json({message: "Time limit exceeded for resetting password"}, {status: 400});
        }
        user.password = await bcrypt.hash(password, 10);
        user.resetOtpVerifiedTill = 0;
        await user.save();
        
        return NextResponse.json({message: "Password reset successful. Continue to login with new password"}, {status: 201});
    }
    catch(error: unknown){
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}