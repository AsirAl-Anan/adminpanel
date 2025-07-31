"use client"

import { useState } from "react"

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("day")

  // Sample data for stats
  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1% from last month",
      icon: (
        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
          />
        </svg>
      ),
    },
    {
      title: "Subscriptions",
      value: "+2,350",
      change: "+180.1% from last month",
      icon: (
        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
          />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: "Active Users",
      value: "+12,234",
      change: "+19% from last month",
      icon: (
        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      title: "Conversion Rate",
      value: "24.5%",
      change: "+4.3% from last month",
      icon: (
        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
    },
  ]

  // Sample data for recent activity
  const recentActivity = [
    { user: "John Doe", action: "created a new project", time: "2 minutes ago", avatar: "JD" },
    { user: "Sarah Smith", action: "completed a task", time: "1 hour ago", avatar: "SS" },
    { user: "Alex Johnson", action: "uploaded a file", time: "3 hours ago", avatar: "AJ" },
    { user: "Emily Brown", action: "commented on a task", time: "5 hours ago", avatar: "EB" },
    { user: "Michael Wilson", action: "started a new sprint", time: "Yesterday", avatar: "MW" },
  ]

  // Sample data for chart
  const chartData = [40, 30, 70, 80, 55, 60, 65, 75, 50, 80, 90, 85]
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Traffic sources data
  const trafficSources = [
    { name: "Direct", percentage: 40, color: "bg-blue-500" },
    { name: "Social", percentage: 30, color: "bg-blue-400" },
    { name: "Organic", percentage: 20, color: "bg-blue-300" },
    { name: "Referral", percentage: 10, color: "bg-blue-200" },
  ]

  return (
    <main className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center gap-2">
          <button className="hidden md:flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["day", "week", "month"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${
                  activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Over Time</h3>
            <p className="text-sm text-gray-600 mt-1">Monthly revenue for the current year</p>
          </div>
          <div className="px-6 pb-6">
            <div className="h-[300px] flex items-end gap-2">
              {chartData.map((height, i) => (
                <div
                  key={i}
                  className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                  style={{ height: `${height}%` }}
                  title={`${months[i]}: ${height}%`}
                ></div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {months.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">Traffic Sources</h3>
            <p className="text-sm text-gray-600 mt-1">Where your visitors are coming from</p>
          </div>
          <div className="px-6 pb-6">
            <div className="h-[300px] flex items-center justify-center">
              <div className="relative h-60 w-60">
                {/* Simplified pie chart representation */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 opacity-80"></div>
                <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {trafficSources.map((source, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${source.color} mr-2`}></div>
                  <span className="text-sm text-gray-700">
                    {source.name} ({source.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600 mt-1">Your team's latest actions</p>
        </div>
        <div className="px-6 pb-4">
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {item.avatar}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none text-gray-900">
                    <span className="font-semibold">{item.user}</span> {item.action}
                  </p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-6">
          <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </main>
  )
}

export default Dashboard
