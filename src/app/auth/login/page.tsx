"use client"
import LoginForm from '@/components/auth/LoginForm'
import Bloom from '@/components/auth/Bloom'
import React from 'react'

const login = () => {
  return (
    <div>
      <div className="flex items-center h-screen w-full">
        <div className='h-full w-3/5 flex justify-center items-center font-extrabold text-5xl text-white text-shadow-black text-shadow-sm'>
          <Bloom/>
        </div>

        <div className='h-full w-2/5 bg-gray-100 flex justify-center items-center'>
          <LoginForm/>
        </div>
      </div>
    </div>
  )
}

export default login