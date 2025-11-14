"use client"

import { NavLink } from "react-router-dom"
import Logo from "../../../public/logo/lightlogo.png"
import {
  LayoutDashboard,
  Book,
  Users,
  Settings,
  LogOut,
  Search,
  ChevronDown,
  ChevronRight,
  Library,
  TrendingUp,
  CreditCard,
  Network,
} from "lucide-react"
import { useState, useEffect, useRef } from "react" // Import useEffect and useRef

// Custom hook to check screen size
const useIsLargeScreen = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isLargeScreen;
};


// Navigation configuration with all segments made expandable
const navigationConfig = {
  segments: [
    {
      title: "MAIN",
      expandable: true,
      key: "main",
      defaultExpanded: true,
      items: [
        {
          path: "/",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "INSIGHTS",
      expandable: true,
      key: "insights",
      defaultExpanded: false,
      items: [
        {
          path: "/analytics",
          label: "Analytics",
          icon: TrendingUp,
          disabled: true,
        },
      ],
    },
      {
      title: "RESOURCES",
      expandable: true,
      key: "resources",
      defaultExpanded: false,
      items: [
        {
          path: "/subjects",
          label: "Subject",
          icon: Book,
        },
        {
          path: "/questions",
          label: "Questions",
          icon: Library,
          disabled: true,
        },
      ],
    },
    {
      title: "PEOPLE",
      expandable: true,
      key: "people",
      defaultExpanded: false,
      items: [
        {
          path: "/users",
          label: "Users",
          icon: Users,
          disabled: true,
        },
        {
          path: "/team",
          label: "Team",
          icon: Network,
          disabled: true,
        },
      ],
    },
    {
      title: "FINANCIALS",
      expandable: true,
      key: "financials",
      defaultExpanded: false,
      items: [
        {
          path: "/finance",
          label: "Finance",
          icon: CreditCard,
          disabled: true,
        },
      ],
    },

  ],
  footer: [
    {
      path: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ],
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const sidebarRef = useRef(null);
  const isLargeScreen = useIsLargeScreen();

  // Initialize expanded state from localStorage or defaults
  const [expandedSegments, setExpandedSegments] = useState(() => {
    try {
      const storedValue = localStorage.getItem("expandedSegments")
      if (storedValue) {
        return JSON.parse(storedValue)
      }
    } catch (error) {
      console.error("Error reading expandedSegments from localStorage:", error)
    }
    // If nothing in storage or parsing fails, use the default configuration
    return navigationConfig.segments.reduce((acc, segment) => {
      if (segment.expandable) {
        acc[segment.key] = segment.defaultExpanded || false
      }
      return acc
    }, {})
  })

  // Effect to save expandedSegments state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("expandedSegments", JSON.stringify(expandedSegments))
    } catch (error) {
      console.error("Error saving expandedSegments to localStorage:", error)
    }
  }, [expandedSegments])

  // Effect to handle clicks outside of the sidebar on small and medium screens
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false)
      }
    }

    if (sidebarOpen && !isLargeScreen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sidebarOpen, setSidebarOpen, isLargeScreen])


  const handleLinkClick = () => {
    if (!isLargeScreen) {
      setSidebarOpen(false);
    }
  };


  const toggleSegment = (segmentKey) => {
    setExpandedSegments((prev) => ({ ...prev, [segmentKey]: !prev[segmentKey] }))
  }

  const renderNavLink = ({ path, label, icon: Icon, disabled }) => {
    const content = (
      <>
        <Icon className="w-5 h-5" />
        <span className="text-sm">{label}</span>
      </>
    )

    if (disabled) {
      return (
        <div
          key={path}
          className="flex items-center gap-3 px-4 py-3 text-muted-foreground/50 cursor-not-allowed opacity-60"
        >
          {content}
        </div>
      )
    }

    return (
      <NavLink
        key={path}
        to={path}
        onClick={handleLinkClick}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 rounded-xl transition-all py-3 ${
            isActive
              ? "bg-primary text-white font-medium" // Active link with a more visible background
              : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
          }`
        }
      >
        {content}
      </NavLink>
    )
  }

  const filteredSegments = navigationConfig.segments.map(segment => ({
    ...segment,
    items: segment.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(segment => segment.items.length > 0);

  const renderSegment = (segment, index) => {
    // Check if the current segment has the active link
    const isActiveSection = segment.items.some(item => window.location.pathname === item.path);

    return (
      <div key={segment.key}>
        {index > 0 && <div className="h-px bg-border my-4" />}
        <button
          onClick={() => toggleSegment(segment.key)}
          className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
            isActiveSection ? 'text-gray-900' : 'text-muted-foreground' // Darker ink for active section
          } hover:text-foreground`}
        >
          <span>{segment.title}</span>
          {expandedSegments[segment.key] ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {expandedSegments[segment.key] && (
          <div className="mt-2 space-y-1">
            {segment.items.map((item) => renderNavLink(item))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-screen bg-white border-r border-border flex flex-col shadow-sm z-30 w-64 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        <div className="px-6 border-b border-border flex items-center h-[69px]">
          <div className="flex items-center  gap-3">

            <NavLink to={'/'}> 
             <img src={Logo} alt="" className="w-20"/>
            </NavLink>
            <div className=" h-8 p-2 rounded-sm bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">Admin Panel</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border-0 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto">
          <div className="space-y-1">
            {filteredSegments.map((segment, index) => renderSegment(segment, index))}
          </div>
        </nav>

        <div className="px-4 py-4 mt-auto border-t border-border">
          <div className="flex items-center justify-between mb-3">
            {navigationConfig.footer.map(({ path, label, icon: Icon, disabled }) => {
              if (disabled) {
                return (
                  <div
                    key={path}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground/50 cursor-not-allowed opacity-60"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                )
              }

              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </NavLink>
              )
            })}
            <button className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar