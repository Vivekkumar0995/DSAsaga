import Navbar from '@/components/Navbar';
import ProfileDetailsPage from '@/components/ProfileDetailsPage';
import React from 'react'

const edit = () => {
  return (
    <div className="min-h-screen bg-gray-100">
        <Navbar/>
        <div className="pt-28">
          <ProfileDetailsPage/>
        </div>
    </div>
  )
}

export default edit;