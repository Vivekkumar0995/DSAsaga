"use client"
import Bloom from '@/components/Bloom'
import React from 'react'
import ForgotForm from '@/components/ForgotForm'

const ForgotPassword = () => {
  return (
    <div>
      <div className="flex items-center h-screen w-full">
        <div className='h-full w-3/5 flex justify-center items-center font-extrabold text-5xl text-white text-shadow-black text-shadow-sm'>
          <Bloom/>
        </div>

        <div className='h-full w-2/5 bg-gray-100 flex justify-center items-center'>
          <ForgotForm />
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword