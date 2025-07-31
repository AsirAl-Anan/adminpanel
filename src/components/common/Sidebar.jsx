import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, BookOpen, Users, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * A sidebar component that is used to navigate through the app.
 *
 * It is rendered as a fixed element on the left side of the screen and is
 * only visible when the sidebarOpen state is true.
 *
 * The component renders a toggle button that can be used to hide or show the
 * sidebar. When the sidebar is visible, the button is rendered on the left side
 * of the screen with a chevron pointing to the right. When the sidebar is
 * hidden, the button is rendered on the left side of the screen with a chevron
 * pointing to the left.
 *
 * The component also renders a navigation menu that is used to navigate
 * through the app. The menu is rendered as an unordered list with links to
 * different parts of the app. The links are rendered as flex items with a
 * chevron icon and the name of the link.
 *
 * The component takes two props: sidebarOpen and setSidebarOpen. The
 * sidebarOpen prop is a boolean that is used to determine whether the sidebar
 * is visible or not. The setSidebarOpen prop is a function that is used to
 * update the state of the sidebarOpen prop.
 */
const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {


  return (
    <>
      
  

      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col shadow-md z-30 w-60 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-60'
        }`}
      >
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2 flex flex-col">
            {/* Main */}
            <ul>
              <li className="mb-2 text-xs text-gray-400 uppercase tracking-wider">Main</li>
              <li>
                <NavLink
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/chat"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition"
                >
                  <MessageSquare className="w-5 h-5" />
                  Messages
                </NavLink>
              </li>
            </ul>

            <hr className="my-3 border-gray-200" />

            {/* Management */}
            <ul>
              <li className="mb-2 text-xs text-gray-400 uppercase tracking-wider">Management</li>
              <li>
                <NavLink
                  to="/qb"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition"
                >
                  <BookOpen className="w-5 h-5" />
                  Manage Q/B
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/manage-users"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition"
                >
                  <Users className="w-5 h-5" />
                  Manage Users
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
        {/* Settings and Logout at the bottom */}
        <div className="px-4 py-6 mt-auto">
          <ul className="flex flex-row gap-2 justify-between">
            <li>
              <NavLink
                to="/logout"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/settings"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition"
              >
                <Settings className="w-5 h-5" />
                Settings
              </NavLink>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}

export default Sidebar