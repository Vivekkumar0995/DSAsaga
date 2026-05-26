"use client"
import { InputOtp, Button } from "@heroui/react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";

type ForWhat = {
    forWhat?: string;
} | null;

type OTPProps = {
    forWhat: ForWhat;
}

export default function OTPForm({forWhat}: OTPProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const params = new URLSearchParams({ next: next });

  const [otp, setOTP] = React.useState("");

  async function handleSubmit (event: any){
    event.preventDefault();
    const verifyingToast = toast.loading("Verifying...");
    try {
      // Case 2 Fix: Only send otp — server reads email & forWhat from encrypted cookie
      const response = await axios.post('/api/auth/verify-otp', { otp });
      toast.success(response.data.message || "OTP verified!!", { id: verifyingToast });
      if(response.data?.next) router.push(response.data.next + "?" + params.toString());
      else router.push(next);
      router.refresh();
    } catch(error: any){
      const errorMessage = error.response?.data?.message || "Verification failed";
      toast.error(errorMessage, { id: verifyingToast });
    }
  }

  async function handleResend (event: any){
    event.preventDefault();
    const sendingToast = toast.loading("Sending...");
    try {
      // Case 2 Fix: No email or forWhat needed — server reads both from encrypted cookie
      const res = await axios.post('/api/auth/send-otp', {});
      toast.success(res.data.message || "OTP resent! Check your email", {id: sendingToast});
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
    <p className="w-fit pr-8 -mt-4 text-right text-sm text-blue-600 hover:text-blue-400 hover:underline cursor-pointer ml-52" onClick={handleResend}>Resend OTP</p>
    <Button className="max-w-fit bg-linear-to-tr from-cyan-500 to-blue-300 text-white shadow-lg" type="submit" variant="flat">
        Verify OTP
    </Button>
    </form>
  );
}
