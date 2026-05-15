import React from "react";
import Bloom from '@/components/auth/Bloom'
import OTPForm from "@/components/auth/OTPForm";
import { decrypt } from "@/lib/auth";
import { cookies } from "next/headers";

const otp = async () => {
  const cookieStore = await cookies();
    const otpForWhat = cookieStore.get("otpForWhat")?.value;
    const forWhatPayload = otpForWhat ? await decrypt(otpForWhat) : null;
    const forWhat =
      forWhatPayload && typeof forWhatPayload === "object" && "otpForWhat" in forWhatPayload && forWhatPayload.userId
        ? { forWhat: String(forWhatPayload.otpForWhat)}
        : null;
  

  return (
    <div>
      <div className="flex items-center h-screen w-full">
        <div className='h-full w-3/5 flex justify-center items-center font-extrabold text-5xl text-white text-shadow-black text-shadow-sm'>
          <Bloom/>
        </div>

        <div className='h-full w-2/5 bg-gray-100 flex justify-center items-center'>
          <OTPForm forWhat={forWhat}/>
        </div>
      </div>
    </div>
  )
}

export default otp;