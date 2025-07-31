import React, { useState, useEffect ,useContext} from 'react';
import { Bell, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, setUser } = useContext(UserContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [username , setUsername] = useState('')
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
 useEffect(()=>{

  if(user){
setUsername(user?.split('@')[0] )

  }



 },[user])
 
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

 return (
  <nav className="bg-white shadow-sm border-b border-gray-200 mx-4 sm:px-6 lg:px-3 py-4 transition-all duration-300">
    <div className="flex items-center justify-between px-4">
      {/* Left side - Sidebar Toggle + Greeting */}
      <div className="flex items-center flex-1 min-w-0">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-2 sm:mr-4 bg-black text-white rounded-full p-2 transition-colors hover:bg-gray-800 flex-shrink-0"
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
        
        {/* Greeting - responsive text */}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 truncate">
            {getGreeting()}, {username}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
            Here's what's happening with your business today
          </p>
        </div>
      </div>

      {/* Center - Date (hidden on small screens) */}
      <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg mx-4">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-sm font-medium text-gray-700">
          {formatDate(currentDate)}
        </span>
      </div>

      {/* Right side - Profile section */}
      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
        {/* Notification bell */}
        {/* <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={18} className="sm:w-5 sm:h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></span>
        </button> */}

        {/* Profile dropdown */}
        {/* <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-xs sm:text-sm">J</span>
          </div>
          <ChevronDown size={14} className="sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block" />
        </div> */}
      </div>
      
    </div>
    
    {/* Mobile date display */}
    <div className="flex md:hidden items-center justify-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg mt-3">
      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
      <span className="text-xs font-medium text-gray-700">
        {formatDate(currentDate)}
      </span>
    </div>
  </nav>
);
};

export default Navbar;