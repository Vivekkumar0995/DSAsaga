"use client"
import Link from 'next/link'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from "react-icons/fc";
import React, { useState } from 'react'
import { FaLock } from "react-icons/fa6";

const ForgotForm = () => {
  const [showPassword, setShowPassword] = useState(false)

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
            className='h-10 w-5/6 rounded-xl border border-gray-300 bg-white px-4 text-black focus:outline-none focus:ring-2 focus:ring-gray-400'
          />
        

          <button type="submit" className='w-5/6 bg-black hover:bg-black text-white py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 hover:cursor-pointer'>
            Continue
          </button>
        </div>
      </form>
  )
}

export default ForgotForm