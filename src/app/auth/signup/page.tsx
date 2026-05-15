"use client"
import React from 'react'
import SignupForm from "@/components/auth/SignupForm"
import Bloom from '@/components/auth/Bloom'

const signup = () => {
  return (
    <div>
      <div className="flex items-center h-screen w-full">
        <div className='h-full w-3/5 flex justify-center items-center font-extrabold text-5xl text-white text-shadow-black text-shadow-sm'>
          <Bloom/>
        </div>

        <div className='h-full w-2/5 bg-gray-100 flex justify-center items-center'>
          <SignupForm/>
        </div>
      </div>
    </div>
  )
}

export default signup