"use client"
import Link from 'next/link'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import React, { useState } from 'react'
import { FaLock } from "react-icons/fa6";
import axios from "axios"
import toast from "react-hot-toast"
import {useRouter, useSearchParams} from "next/navigation";

type ResetUser = {
  userId?: string;
} | null;

type ResetProps = {
  resetUser: ResetUser;
};

const ForgotForm = ({resetUser} : ResetProps ) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const params = new URLSearchParams({next: next});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState('');
  const [cpassword, setcPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [user, setUser] = React.useState<ResetUser>(resetUser);

  React.useEffect(() => {
    setUser(resetUser);
  }, [resetUser]);

  const handleEmailSubmit = async (event: any) => {
    event.preventDefault();
    const loadingToast = toast.loading("Sending OTP...");
    try{
      const response = await axios.post("/api/auth/send-otp", {email: email, forWhat: "reset"});
      toast.success(response.data.message || "Check your email for OTP", { id: loadingToast });
      router.push(`/otp?${params.toString()}`)
      router.refresh();
    }
    catch(error : any){
      const errorMessage = error.response?.data?.message || "Failed to send OTP";
      toast.error(errorMessage, { id: loadingToast });
    }
  }

  const handleNewPassword = async (event: any) => {
    event.preventDefault();
    if(password === ""){
      toast.error("Password can't be empty");
      document.getElementById("password")?.focus();
      return;
    }
    if(password !== cpassword){
      toast.error("Password and confirm password are different");
      document.getElementById("confirmPassword")?.focus();
      return;
    }
    const loadingToast = toast.loading("Updating your password...");
    try{
      const response = await axios.post("/api/auth/reset-password", { password: password });
      toast.success(response.data.message || "Password reset successful.", {id: loadingToast});
      router.push(`/login?${params.toString()}`);
      router.refresh();
    }
    catch(error: any){
      const errorMessage = error.response?.data?.message || "Failed to reset password due to server error"
      toast.error(errorMessage, { id: loadingToast });
    }
  }

  return (
      <form action="" className='bg-white flex flex-col items-center rounded-2xl shadow-lg w-3/5 hover:shadow-xl hover:scale-101 transition-transform duration-500 ease-in-out p-5'>
        <FaLock className='text-2xl'/>
        <h1 className='text-xl font-bold text-black p-5'>Reset Password</h1>
        <p className="text-sm w-5/6">We need to check if this is your email. Please enter email to get verification OTP</p>

        <div className='flex flex-col gap-5 items-center w-full p-5'>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter email"
            value={email}
            className='h-10 w-5/6 rounded-xl border border-gray-300 bg-white px-4 text-black focus:outline-none focus:ring-2 focus:ring-gray-400'
            onChange = {(e) => setEmail(e.target.value)}
          />


          { !user &&
            (<button type="submit" className='w-5/6 bg-black hover:bg-black text-white py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 hover:cursor-pointer' onClick={handleEmailSubmit}>
              Continue
            </button>)
          }

          { user &&
          (<>
          <div className='relative w-5/6'>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="New password"
              className='h-10 w-full rounded-xl border border-gray-300 bg-white px-4 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-gray-400'
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((current) => !current)}
              className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:cursor-pointer hover:text-black'
            >
              {showPassword ? <FiEyeOff className='text-sm' /> : <FiEye className='text-sm' />}
            </button>
          </div>

          <div className='relative w-5/6'>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Confirm new password"
              className='h-10 w-full rounded-xl border border-gray-300 bg-white px-4 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-gray-400'
              onChange={(e) => setcPassword(e.target.value)}
              required
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              onClick={() => setShowConfirmPassword((current) => !current)}
              className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:cursor-pointer hover:text-black'
            >
              {showConfirmPassword ? <FiEyeOff className='text-sm' /> : <FiEye className='text-sm' />}
            </button>
          </div>
          <button type="submit" className='w-5/6 bg-black hover:bg-black text-white py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 hover:cursor-pointer' onClick={handleNewPassword}>
            Continue
          </button>
        </>
        )}
        </div>
      </form>
  )
}

export default ForgotForm
