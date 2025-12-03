"use client"

import { useEffect, useState } from "react"
import { Mail, Lock, Eye, EyeOff, Loader2, X } from "lucide-react"
import axios from "axios"
import { useNavigate, useSearchParams } from "react-router-dom"
import { UserContext } from "../../context/UserContext.jsx"
import { useContext } from "react"
import { showSuccessToast, showErrorToast } from "../../../lib/toast"
import { useLocation } from "react-router-dom"
export default function LoginPage() {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const email = queryParams.get("email")
  const { user, setUser } = useContext(UserContext)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    email: email || "",
    password: "",
  })

  const navigate = useNavigate()
  const hasEmailParam = searchParams.has('email')

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/")
    }
  }, [user, navigate])

  // Handle error from URL (e.g. Google OAuth errors)
  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      showErrorToast(error)
      // Clear the error from URL without refreshing
      const newParams = new URLSearchParams(searchParams)
      newParams.delete("error")
      setSearchParams(newParams)
    }
  }, [searchParams, setSearchParams])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await axios.post(import.meta.env.VITE_API_URL + "/auth/login", JSON.stringify(formData), {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      })

      console.log("in login", res)
      if (res.data.success) {
        setUser(res.data.response)
        showSuccessToast("Login successful!")
        setTimeout(() => {
          navigate("/")
        }, 1500)
      } else {
        showErrorToast(res.data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      showErrorToast(error.response?.data?.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-card backdrop-blur-xl rounded-xl p-8 shadow-xl border border-border relative"
        >
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-foreground font-medium">Signing you in...</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {hasEmailParam ? (
              <>
                {/* Email Display */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-secondary/50 rounded-full border border-border">
                    <div className="p-1 bg-background rounded-full">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{formData.email}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchParams({})
                        setFormData(prev => ({ ...prev, email: "" }))
                      }}
                      className="ml-1 p-0.5 hover:bg-background rounded-full transition-colors"
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full pl-12 pr-12 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </>
            ) : (
              /* Google Login Button */
              <button
                type="button"
                disabled={isLoading}
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
                className="w-full py-3 bg-background border border-border text-foreground font-semibold rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>© 2025 uttor.net . All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
