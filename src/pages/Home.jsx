import React, { useState, useContext, useEffect } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import { UserContext } from '../context/UserContext';

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Check auth on mount
  useEffect(() => {
    if (user === null) return; // still loading user
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (user === undefined || user === null) {
    // Show nothing or a loading spinner while checking auth
    return <div className="p-6 text-center">Loading...</div>;
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
  );
};

export default Home;
