import Bloom from '@/components/auth/Bloom'
import React from 'react'
import ForgotForm from '@/components/auth/ForgotForm'
import { cookies } from "next/headers";
import { decrypt } from "@/lib/jose_auth";

const ForgotPassword = async () => {

  const cookieStore = await cookies();
  const reset = cookieStore.get("resetPassword")?.value;
  const resetPayload = reset ? await decrypt(reset) : null;
  const resetUser =
    resetPayload && typeof resetPayload === "object" && "userId" in resetPayload && resetPayload.userId
      ? { userId: String(resetPayload.userId)}
      : null;


  return (
    <div>
      <div className="flex items-center h-screen w-full">
        <div className='h-full w-3/5 flex justify-center items-center font-extrabold text-5xl text-white text-shadow-black text-shadow-sm'>
          <Bloom/>
        </div>

        <div className='h-full w-2/5 bg-gray-100 flex justify-center items-center'>
          <ForgotForm resetUser={resetUser}/>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword