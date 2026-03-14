"use client"
import Link from 'next/link'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from "react-icons/fc";
import React, { useState } from 'react'

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full h-full flex justify-center items-center">
        <form action="" className='bg-white h-3/5 flex flex-col justify-center gap-5 items-center p-5 rounded-2xl shadow-lg w-3/5 mt-25 hover:shadow-xl hover:scale-101 transition-transform duration-500 ease-in-out'>

        <h1 className='text-2xl font-bold text-black'>Welcome Back</h1>

          <button type="submit" className='w-5/6 bg-white hover:bg-gray-100 text-black py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 hover:cursor-pointer flex items-center justify-center gap-3 border border-gray-300'>
            <FcGoogle className='text-2xl shrink-0' />
            Continue with Google
          </button>

          <p className='text-gray-500' >OR</p>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter email"
            className='h-10 w-5/6 rounded-xl border border-gray-300 bg-white px-4 text-black focus:outline-none focus:ring-2 focus:ring-gray-400'
          />
          
          <div className='relative w-5/6'>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter password"
              className='h-10 w-full rounded-xl border border-gray-300 bg-white px-4 pr-12 text-black focus:outline-none focus:ring-2 focus:ring-gray-400'
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
          
          <button type="submit" className='w-5/6 bg-black hover:bg-black text-white py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 hover:cursor-pointer'>
            Continue
          </button>
          <p className='text-black text-sm'>
            Don't have an account? <Link href="/auth/signup" className='text-blue-500 hover:underline'>Sign up</Link>
          </p>
        </form>
    </div>
  )
}

export default LoginForm