"use client"
import React from 'react'
import Navbar from "@/components/Navbar"
import SignupForm from "@/components/SignupForm"

const signup = () => {
  return (
    <div>
      <Navbar />
      <div className="bg-amber-50 flex items-center h-screen w-full">
        <div className='h-full w-3/5 bg-blue-300 flex justify-center items-center font-extrabold text-5xl text-white text-shadow-black text-shadow-sm'>
          Welcome to DSASaga  
        </div>

        <div className='h-full w-2/5 bg-gray-100 flex justify-center items-center'>
          <SignupForm/>
        </div>
      </div>
    </div>
  )
}

export default signup