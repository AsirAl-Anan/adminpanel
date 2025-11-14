"use client"

import { useState } from "react"
import { ImageIcon, PenTool, Star, TrendingUp, Users, BookOpen, Clock } from "lucide-react"

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home")

  const recentApps = [
    {
      id: 1,
      name: "Question Bank",
      description: "Manage and organize questions",
      icon: <BookOpen className="w-6 h-6 text-purple-600" />,
      route: "/qb",
    },
    {
      id: 2,
      name: "User Management",
      description: "Control user access and permissions",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      route: "/manage-users",
    },
    {
      id: 3,
      name: "Creative Questions",
      description: "Add new creative questions",
      icon: <PenTool className="w-6 h-6 text-orange-600" />,
      route: "/add-cq",
    },
  ]

  const activeProjects = [
    { name: "Mathematics Database", status: "In Progress", progress: 75, color: "bg-purple-600" },
    { name: "Physics Questions", status: "In Progress", progress: 45, color: "bg-blue-600" },
    { name: "Chemistry Content", status: "Planning", progress: 20, color: "bg-orange-600" },
  ]

  const stats = [
    { label: "Total Questions", value: "2,543", icon: <BookOpen className="w-5 h-5" />, trend: "+12%" },
    { label: "Active Users", value: "145", icon: <Users className="w-5 h-5" />, trend: "+8%" },
    { label: "Subjects", value: "24", icon: <TrendingUp className="w-5 h-5" />, trend: "+3%" },
    { label: "Pending Review", value: "18", icon: <Clock className="w-5 h-5" />, trend: "-5%" },
  ]

  return (
    <main className="space-y-6 min-h-screen">
   

     

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-secondary rounded-xl text-muted-foreground">{stat.icon}</div>
              <span className={`text-sm font-medium ${stat.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                {stat.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">Recent Apps</h3>
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-secondary rounded-xl group-hover:bg-purple-100 transition-colors">
                  {app.icon}
                </div>
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <Star className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <h4 className="text-base font-semibold text-foreground mb-2">{app.name}</h4>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{app.description}</p>

              <button className="w-full py-2.5 bg-secondary text-foreground font-medium rounded-xl hover:bg-muted transition-colors">
                Open
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">Active Projects</h3>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              View All
            </button>
          </div>

          <div className="space-y-3">
            {activeProjects.map((project, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-foreground">{project.name}</h4>
                  <span className="text-xs px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                    {project.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${project.color} transition-all duration-500`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">Recent Files</h3>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              View All
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="space-y-4">
              {[
                { name: "Physics Chapter 5", type: "Document", time: "2 hours ago" },
                { name: "Math Questions Set", type: "Database", time: "5 hours ago" },
                { name: "Chemistry Notes", type: "Document", time: "Yesterday" },
              ].map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 hover:bg-secondary rounded-xl transition-colors cursor-pointer"
                >
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.type} • {file.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Dashboard
