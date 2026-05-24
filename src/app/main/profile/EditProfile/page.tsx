import Navbar from '@/components/ui/Navbar';
import ProfileDetailsPage from '@/components/profile/ProfileDetailsPage';
import React from 'react'

const edit = () => {
  return (
    <div className="min-h-screen bg-gray-100">
        <div className="pt-28">
          <ProfileDetailsPage/>
        </div>
    </div> 
  )
}

export default edit;