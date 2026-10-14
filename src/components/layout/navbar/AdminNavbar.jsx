import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, User, LogOut, ChevronDown, Menu, UserCheck } from "lucide-react";

import { useDispatch } from "react-redux";
import { userLoggedOut } from "@/services/auth/authSlice";
import { toast } from "react-hot-toast";
import useAuth from "@/hooks/useAuth.js";

const AdminNavbar = () => {
  const { user } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(userLoggedOut());
    toast.success("Logged out successfully");
    navigate("/login");
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 px-6 flex items-center justify-between">
      {/* Left side - Mobile menu button and breadcrumb */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:block">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
        </div>
      </div>

      {/* Right side - Search, notifications, and user menu */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="hidden md:block relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 relative">
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
        </button>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center shadow-xs">
              {user?.profile_pic ? (
                <img
                  src={import.meta.env.VITE_API_URL + user?.profile_pic}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.nameEn || user?.nameBn || user?.name || (user?.firstName && user?.lastName ? `${user?.firstName} ${user?.lastName}` : "User")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.nameEn || user?.nameBn || user?.name || (user?.firstName && user?.lastName ? `${user?.firstName} ${user?.lastName}` : "User")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 ">
                  {user?.email}
                </p>
              </div>

              <Link
                to="/my-info"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowDropdown(false)}
              >
                <UserCheck className="w-4 h-4 mr-3 text-primary" />
                My Info & ID Card
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>

          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
          <div className="px-4 py-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
