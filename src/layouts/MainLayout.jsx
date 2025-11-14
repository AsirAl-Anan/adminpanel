"use client"

import { useState, useContext, useEffect } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import Navbar from "../components/common/Navbar"
import Sidebar from "../components/common/Sidebar"
import { UserContext } from "../context/UserContext"
import { FadeLoader } from "react-spinners"

const Home = () => {
  // Initialize sidebarOpen state from localStorage, defaulting to true
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const storedValue = localStorage.getItem("sidebarOpen")
      // If a value is stored, parse it. Otherwise, default to true.
      return storedValue !== null ? JSON.parse(storedValue) : true
    } catch {
      // If parsing fails, default to true.
      return true
    }
  })

  const { user } = useContext(UserContext)
  const navigate = useNavigate()

  // Effect to handle user authentication state
  useEffect(() => {
    if (user === null) return
    if (!user) navigate("/login")
  }, [user, navigate])

  // Effect to save sidebarOpen state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen))
    } catch (error) {
      console.error("Error saving sidebarOpen state to localStorage:", error)
    }
  }, [sidebarOpen])

  if (user === undefined || user === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FadeLoader color="#8B5CF6" />
      </div>
    )
  }

  return (
    <div className="bg-background">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`relative min-h-screen transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : ""}`}>
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Home
