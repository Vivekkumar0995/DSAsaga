"use client"
import React from "react";
import {InputOtp, Button} from "@heroui/react";
import Bloom from '@/components/Bloom'
import Navbar from "@/components/Navbar"
import Link from "next/link";
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function App() {
  const router = useRouter();
  const [otp, setOTP] = React.useState("");

  async function handleSubmit (event: any){
    event.preventDefault();
    const email = localStorage.getItem('email');
    const verifyingToast = toast.loading("Verifying...");
    try {
      const response = await axios.post('/api/auth/verify-otp', {otp, email});
      toast.success(response.data.message || "OTP verified!!", { id: verifyingToast });
      router.push('/');
      router.refresh();
    } catch(error: any){
      const errorMessage = error.response?.data?.message || "Signup failed";
      toast.error(errorMessage, { id: verifyingToast });
    }
  }

  async function handleResend (event: any){
    event.preventDefault();
    const email = localStorage.getItem('email');
    const sendingToast = toast.loading("Sending...");
    try {
      const otp = await axios.post('/api/auth/send-otp', {email});
      toast.success(otp.data.message || "OTP resent! Check your email", {id: sendingToast});
      router.refresh();
    } catch(error: any) {
      const errorMessage = error.response?.data?.message || "Failed to send OTP";
      toast.error(errorMessage, {id: sendingToast});
    }
  }

  const keepCaretAtCurrentIndex = (event: React.FocusEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
    const input = event.currentTarget.querySelector("input");
    if (!input) return;
    const nextIndex = Math.min(otp.length, 6);
    requestAnimationFrame(() => {
      input.setSelectionRange(nextIndex, nextIndex);
    });
  };


  return (
    <div>
      <Navbar />
      <div className="flex items-center h-screen w-full">
        <div className='h-full w-3/5 flex justify-center items-center font-extrabold text-5xl text-white text-shadow-black text-shadow-sm'>
          <Bloom/>
        </div>

        <div className='h-full w-2/5 bg-gray-100 flex justify-center items-center'>
          <form className="bg-white h-2/5 flex flex-col justify-center gap-5 items-center p-5 rounded-2xl shadow-lg w-3/5 mt-25 hover:shadow-xl hover:scale-101 transition-transform duration-500 ease-in-out" onSubmit={handleSubmit}>
            <p className="text-2xl font-bold">Enter OTP</p>
            <InputOtp
              isRequired
              fullWidth={false}
              length={6}
              value={otp}
              color="primary"
              variant="bordered"
              radius="lg"
              description="Enter the 6-digit code"
              classNames={{
                base: "w-fit mx-auto items-center",
                helperWrapper: "w-full text-center",
                description: "w-full text-left",
                errorMessage: "w-full text-center",
              }}
              onValueChange={setOTP}
              onFocus={keepCaretAtCurrentIndex}
              onClick={keepCaretAtCurrentIndex}
            />
            <Link href="" className="w-full pr-8 -mt-4 text-right text-sm text-blue-600 hover:text-blue-400" onClick={handleResend}>Resend OTP</Link>
            <Button className="max-w-fit bg-linear-to-tr from-cyan-500 to-blue-300 text-white shadow-lg" type="submit" variant="flat">
              Verify OTP
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
