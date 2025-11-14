"use client"

import { useState, useEffect, useContext } from "react"
import { ChevronLeft, ChevronRight, Bell, MessageSquare, User } from "lucide-react"
import { UserContext } from "../../context/UserContext"

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, setUser } = useContext(UserContext)
  const [username, setUsername] = useState("")
  const [currentDateTime, setCurrentDateTime] = useState(new Date())

  // Effect to update the username when the user context changes
  useEffect(() => {
    if (user) {
      setUsername(user?.split("@")[0])
    }
  }, [user])

  // Effect to update the date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    // Cleanup the interval when the component is unmounted
    return () => clearInterval(timer)
  }, [])

  // Formats the time to a "HH:MM AM/PM" format
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  // Formats the date to a "Weekday D/M/YYYY" format
  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'numeric', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  return (
    <nav className="bg-white border-b border-border transition-all duration-300 sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between h-[69px]">
        {/* Left side - Sidebar Toggle + Date and Time */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
            aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5 text-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-foreground" />
            )}
          </button>

          {/* Modern Date and Time Display */}
          <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-lg">
            <div className="text-sm text-gray-600">
              <div>{formatDate(currentDateTime).split(',')[0]}</div>
              <div>{`${currentDateTime.getDate()}/${currentDateTime.getMonth() + 1}/${currentDateTime.getFullYear()}`}</div>
            </div>
           
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-secondary rounded-xl transition-colors relative">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
          </button>

          <button className="p-2 hover:bg-secondary rounded-xl transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="ml-2 flex items-center gap-3 px-3 py-2 hover:bg-secondary rounded-xl transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground hidden md:block">{username || "Admin"}</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
