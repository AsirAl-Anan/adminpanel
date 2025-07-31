import React, { useState, useContext, useEffect } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import { UserContext } from '../context/UserContext';

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  // console.log("User in Home:", user);
  // useEffect(() => {
  //   // Redirect to login if user is not logged in or is not an admin
  //   if (!user ) {
  //     navigate('/login');
  //   }
  // }, []);

   // Don't render anything if user is not authenticated
   if (!user) {
     navigate('/login');
     return null;
   }

  return (
    <div className="h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content area */}
      <div
        className={`flex flex-col h-full transition-all duration-300 ${
          sidebarOpen ? 'ml-60' : 'ml-0'
        }`}
      >
        {/* Navbar */}
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Home